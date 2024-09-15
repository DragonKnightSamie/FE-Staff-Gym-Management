import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Staff } from 'app/types/staff.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StaffService {

    private _staff: BehaviorSubject<Staff | null> = new BehaviorSubject(null);
    private _staffs: BehaviorSubject<Staff[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for staff
 */
    get staff$(): Observable<Staff> {
        return this._staff.asObservable();
    }

    /**
     * Getter for staffs
     */
    get staffs$(): Observable<Staff[]> {
        return this._staffs.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getStaffs(filter: any = {}):
        Observable<{ pagination: Pagination; data: Staff[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Staff[] }>('/api/admin/staffs/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._staffs.next(response.data);
            }),
        );
    }

    /**
     * Get staff by id
     */
    getStaffById(id: string): Observable<Staff> {
        return this.staffs$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Staff>('/api/admin/staffs/' + id).pipe(
                map((staff) => {

                    // Set value for current staff
                    this._staff.next(staff);

                    // Return the new contact
                    return staff;
                })
            ))
        );
    }

    /**
* Create staff
*/
    createStaff(data) {
        return this.staffs$.pipe(
            take(1),
            switchMap((staffs) => this._httpClient.post<Staff>('/api/admin/staffs', data).pipe(
                map((newStaff) => {

                    // Update staff list with current page size
                    this._staffs.next([newStaff, ...staffs].slice(0, this._pagination.value.pageSize));

                    return newStaff;
                })
            ))
        )
    }

    /**
    * Update staff
    */
    updateStaff(id: string, data) {
        return this.staffs$.pipe(
            take(1),
            switchMap((staffs) => this._httpClient.put<Staff>('/api/admin/staffs/' + id, data).pipe(
                map((updatedStaff) => {

                    // Find and replace updated staff
                    const index = staffs.findIndex(item => item.id === id);
                    staffs[index] = updatedStaff;
                    this._staffs.next(staffs);

                    // Update staff
                    this._staff.next(updatedStaff);

                    return updatedStaff;
                })
            ))
        )
    }

    deleteStaff(id: string): Observable<boolean> {
        return this.staffs$.pipe(
            take(1),
            switchMap(staffs => this._httpClient.delete('/api/admin/staffs/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = staffs.findIndex(item => item.id === id);

                    // Delete the product
                    staffs.splice(index, 1);

                    // Update the staffs
                    this._staffs.next(staffs);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}