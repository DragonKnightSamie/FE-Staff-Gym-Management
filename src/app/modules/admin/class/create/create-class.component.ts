import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseCardComponent } from '@fuse/components/card';
import { Course } from 'app/types/course.type';
import { Trainer } from 'app/types/trainer.type';
import { Wishlist } from 'app/types/wishlist.type';
import { Observable } from 'rxjs';
import { CourseService } from '../../course/course.service';
import { TrainerService } from '../../trainer/trainer.service';
import { WishlistService } from '../../wishlist/wishlist.service';
import { ClassService } from '../class.service';

@Component({
    selector: 'create-class',
    standalone: true,
    templateUrl: './create-class.component.html',
    imports: [CommonModule, FuseCardComponent, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, FormsModule,
        ReactiveFormsModule, MatDatepickerModule, MatSelectModule],
    providers: [DatePipe]
})
export class CreateClassComponent implements OnInit {
    selectedCourseId: string;
    courses$: Observable<Course[]>;
    trainers$: Observable<Trainer[]>;
    wishlists$: Observable<Wishlist[]>;
    selectedMemberIds: string[];
    classForm: UntypedFormGroup;

    constructor(
        private _classService: ClassService,
        private _courseService: CourseService,
        private _wishlistService: WishlistService,
        private _trainerService: TrainerService,
        private _datePipe: DatePipe,
        private _dialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<CreateClassComponent>
    ) { }

    ngOnInit(): void {
        this.initClassForm();
        this.courses$ = this._courseService.courses$;
        this.trainers$ = this._trainerService.trainers$;
        this.wishlists$ = this._wishlistService.wishlists$;
    }

    initClassForm() {
        this.classForm = this._formBuilder.group({
            name: [null, [Validators.required]],
            description: [null],
            from: [null, Validators.required],
            trainerId: [null],
            slotCreateModel: this._formBuilder.group({
                startDate: [null, [Validators.required]],
                package: [null, [Validators.required]]
            })
        });
    }

    onCourseChange(event: any) {
        this.selectedCourseId = event.value;
        // this._wishlistService.getCourseWishlists({ courseId: this.selectedCourseId }).subscribe();
    }

    onTrainerChange(event: any) {
        this.classForm.controls['trainerId'].setValue(event.value);
    }

    onPackageChange(event: any) {
        this.classForm.get('slotCreateModel.package').setValue(event.value);
    }

    private formatTime() {
        const time = this.classForm.controls['from'].value;
        const formatTime = time + ':00';
        this.classForm.controls['from'].setValue(formatTime);
    }

    createClass() {
        this.formatTime();
        if (this.classForm.valid) {
            this._classService.createClass(this.selectedCourseId, this.classForm.value).subscribe(result => {
                this.matDialogRef.close('success');
            })
        }
    }
}