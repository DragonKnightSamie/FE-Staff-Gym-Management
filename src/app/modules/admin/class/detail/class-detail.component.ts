import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FuseCardComponent } from '@fuse/components/card';
import { Class } from 'app/types/class.type';
import { Course } from 'app/types/course.type';
import { Observable, take } from 'rxjs';
import { CourseService } from '../../course/course.service';
import { SlotDetailComponent } from '../../slot/detail/slot-detail.component';
import { SlotService } from '../../slot/slot.service';
import { ClassService } from '../class.service';
import { MemberComponent } from '../member/member.component';
import { WishlistService } from '../../wishlist/wishlist.service';
@Component({
    selector: 'class-detail',
    standalone: true,
    templateUrl: './class-detail.component.html',
    imports: [CommonModule, FullCalendarModule, FuseCardComponent, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, FormsModule,
        ReactiveFormsModule, MatDatepickerModule, MatSelectModule],
    providers: [DatePipe]
})
export class ClassDetailComponent implements OnInit {
    class$: Observable<Class>;
    course$: Observable<Course>;
    today = new Date();
    events: any[] = [];
    classForm: UntypedFormGroup;

    calendarOptions: CalendarOptions;

    constructor(
        private _classService: ClassService,
        private _courseService: CourseService,
        private _datePipe: DatePipe,
        private _slotService: SlotService,
        private wishlistService: WishlistService,
        private _dialog: MatDialog,
        private _formBuilder: UntypedFormBuilder
    ) { }

    ngOnInit(): void {
        this.class$ = this._classService.class$;
        this.course$ = this._courseService.course$;
        this._slotService.slots$.subscribe(slots => {
            this.events = this._classService.mapObjects(slots, this._datePipe);
            this.initCalendarOptions();
        });
        this.initClassForm();
    }

    initCalendarOptions() {
        this.calendarOptions = {
            initialView: 'dayGridMonth',
            // validRange: {
            //     start: this.today
            // },
            buttonText: {
                today: 'To day',
                next: 'Next Month',
                prev: 'Previous Month',
            },
            plugins: [dayGridPlugin, interactionPlugin],
            eventClick: (arg) => this.handleEventClick(arg),
            events: this.events
        };
    }

    handleEventClick(arg: EventClickArg) {
        const id = arg.event._def.extendedProps.publicId;
        this._slotService.getSlotById(id).subscribe(() => {
            this._dialog.open(SlotDetailComponent, {
                width: '720px'
            })
        })
    }

    initClassForm() {
        this.class$.pipe(take(1)).subscribe((cl) => {
            this.classForm = this._formBuilder.group({
                name: [cl.name, [Validators.required]],
                from: [{ value: cl.from, disabled: true }, [Validators.required]],
                to: [{ value: cl.to, disabled: true }, [Validators.required]],
                status: [cl.status, [Validators.required]],
                lessonCount: [{ value: cl.lessonCount, disabled: true }, [Validators.required]],
                totalLesson: [{ value: cl.totalLesson, disabled: true }, [Validators.required]],
            });
        });
    }

    updateClass() {
        let id;
        this.class$.subscribe(cl => {
            id = cl.id
        })
        this._classService.updateClass(id, this.classForm.value).subscribe({
            next: () => {

            },
            error: (error) => {

            }
        });
    }

    onStatusChange(event: any) {
        this.classForm.controls['status'].setValue(event.value);
    }

    viewMember() {
        let id;
        this.class$.subscribe(cl => {
            id = cl.id
        })
        this._classService.getClassMembers(id).subscribe((members) => {
            this.wishlistService.getCourseWishlists(id).subscribe(wishlist => {
                this._dialog.open(MemberComponent, {
                    data: {
                        classId: id,
                    },
                    width: '720px'
                })
            })
        })
    }
}