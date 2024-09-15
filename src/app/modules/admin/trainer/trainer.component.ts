import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FuseAlertComponent } from '@fuse/components/alert';
import { Pagination } from 'app/types/pagination.type';
import { Trainer } from 'app/types/trainer.type';
import { Observable, Subject, debounceTime, filter, map, merge, of, switchMap, takeUntil } from 'rxjs';
import { CreateTrainerComponent } from './create/create-trainer.component';
import { TrainerDetailComponent } from './detail/trainer-detail.component';
import { TrainerService } from './trainer.service';

@Component({
    selector: 'trainer',
    standalone: true,
    templateUrl: './trainer.component.html',
    styleUrls: ['./trainer.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatSortModule, MatPaginatorModule,
        MatSelectModule, MatOptionModule, FuseAlertComponent, MatCheckboxModule]
})
export class TrainerComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChildren('inputField') inputFields: QueryList<ElementRef>;

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    filterForm: UntypedFormGroup;

    trainers$: Observable<Trainer[]>;
    pagination: Pagination;
    isLoading: boolean = false;
    flashMessage: 'success' | 'error' | null = null;
    message: string = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _trainerService: TrainerService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _dialog: MatDialog
    ) { }

    ngOnInit(): void {

        // Get the trainers
        this.getTrainers();

        // Get the pagination
        this._trainerService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.initFilterForm();
        this.subcribeFilterForm();
    }

    /**
* After view init
*/
    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true
            });

            // Detect changes
            this._changeDetectorRef.detectChanges();

            // If the invoices changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    const isAsc = this._sort.direction === 'asc';
                    this.setSortFilter(this._sort.active, isAsc)
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;
                });

            // Get invoices if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.setPaginationFilter(this._paginator.pageIndex, this._paginator.pageSize)
                    this.isLoading = true;
                    return of(true);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }

    private getTrainers() {
        this.trainers$ = this._trainerService.trainers$;
    }

    private setPaginationFilter(pageIndex: number, pageSize: number) {
        this.filterForm.patchValue({
            pagination: {
                pageNumber: pageIndex,
                pageSize: pageSize
            },
        })
    }

    private setSortFilter(orderBy: string, isAscending: boolean) {
        this.filterForm.controls['orderBy'].setValue(orderBy);
        this.filterForm.controls['isAscending'].setValue(isAscending);
    }

    private initFilterForm() {
        this.filterForm = this._formBuilder.group({
            search: [null],
            orderBy: [null],
            pagination: [{
                pageNumber: this.pagination.pageNumber,
                pageSize: this.pagination.pageSize,
            }],
            isAscending: [null]
        });
    }

    private subcribeFilterForm() {
        this.filterForm.valueChanges.pipe(
            takeUntil(this._unsubscribeAll),
            filter(() => this.filterForm.valid),
            debounceTime(500),
            switchMap((filter) => {
                this.isLoading = true;
                this._trainerService.getTrainers(filter).subscribe(result => {
                    if (result.data.length == 0) {
                        this.showFlashMessage('error', 'No items were found', 3000)
                    }
                });
                return of(true);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    private showFlashMessage(type: 'success' | 'error', message: string, time: number): void {
        this.flashMessage = type;
        this.message = message;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
            this.flashMessage = this.message = null;
            this._changeDetectorRef.markForCheck();
        }, time);
    }

    openCreateTrainerDialog() {
        this._dialog.open(CreateTrainerComponent, {
            width: '720px'
        }).afterClosed().subscribe(result => {
            if (result === 'success') {
                this.showFlashMessage('success', 'Create trainer successful', 3000);
            }
        })
    }

    openTrainerDetailDialog(id: string) {
        this._trainerService.getTrainerById(id).subscribe(trainer => {
            if (trainer) {
                this._dialog.open(TrainerDetailComponent, {
                    width: '720px'
                }).afterClosed().subscribe(result => {
                    if (result === 'success') {
                        this.showFlashMessage('success', 'Update trainer successful', 3000);
                    }
                })
            }
        })
    }
}