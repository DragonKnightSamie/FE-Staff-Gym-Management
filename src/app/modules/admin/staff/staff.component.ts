import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FuseAlertComponent } from '@fuse/components/alert';
import { Staff } from 'app/types/staff.type';
import { Pagination } from 'app/types/pagination.type';
import { Observable, Subject, debounceTime, filter, map, merge, of, switchMap, takeUntil } from 'rxjs';
import { StaffService } from './staff.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { CreateStaffComponent } from './create/create-staff.component';
import { StaffDetailComponent } from './detail/staff-detail.component';

@Component({
    selector: 'staff',
    standalone: true,
    templateUrl: './staff.component.html',
    styleUrls: ['./staff.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatSortModule, MatPaginatorModule,
        MatSelectModule, MatOptionModule, FuseAlertComponent, MatCheckboxModule]
})
export class StaffComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChildren('inputField') inputFields: QueryList<ElementRef>;

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    filterForm: UntypedFormGroup;

    staffs$: Observable<Staff[]>;
    pagination: Pagination;
    isLoading: boolean = false;
    flashMessage: 'success' | 'error' | null = null;
    message: string = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _staffService: StaffService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _dialog: MatDialog
    ) { }

    ngOnInit(): void {

        // Get the staffs
        this.getStaffs();

        // Get the pagination
        this._staffService.pagination$
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

    private getStaffs() {
        this.staffs$ = this._staffService.staffs$;
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
                this._staffService.getStaffs(filter).subscribe(result => {
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

    openCreateStaffDialog() {
        this._dialog.open(CreateStaffComponent, {
            width: '720px'
        }).afterClosed().subscribe(result => {
            if (result === 'success') {
                this.showFlashMessage('success', 'Create staff successful', 3000);
            }
        })
    }

    openStaffDetailDialog(id: string) {
        this._staffService.getStaffById(id).subscribe(staff => {
            if (staff) {
                this._dialog.open(StaffDetailComponent, {
                    width: '720px'
                }).afterClosed().subscribe(result => {
                    if (result === 'success') {
                        this.showFlashMessage('success', 'Update staff successful', 3000);
                    }
                })
            }
        })
    }
}