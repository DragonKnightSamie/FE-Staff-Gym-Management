import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Slot } from 'app/types/slot.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SlotService {

    private _slot: BehaviorSubject<Slot | null> = new BehaviorSubject(null);
    private _slots: BehaviorSubject<Slot[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for slot
 */
    get slot$(): Observable<Slot> {
        return this._slot.asObservable();
    }

    /**
     * Getter for slots
     */
    get slots$(): Observable<Slot[]> {
        return this._slots.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getSlots(filter: any = {}):
        Observable<{ pagination: Pagination; data: Slot[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Slot[] }>('/api/slots/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._slots.next(response.data);
            }),
        );
    }

    /**
     * Get slot by id
     */
    getSlotById(id: string): Observable<Slot> {
        return this.slots$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Slot>('/api/slots/' + id).pipe(
                map((slot) => {

                    // Set value for current slot
                    this._slot.next(slot);

                    // Return the new contact
                    return slot;
                })
            ))
        );
    }

    /**
* Create slot
*/
    createSlot(data) {
        return this.slots$.pipe(
            take(1),
            switchMap((slots) => this._httpClient.post<Slot>('/api/slots', data).pipe(
                map((newSlot) => {

                    // Update slot list with current page size
                    this._slots.next([newSlot, ...slots].slice(0, this._pagination.value.pageSize));

                    return newSlot;
                })
            ))
        )
    }

    /**
    * Update slot
    */
    updateSlot(id: string, data) {
        return this.slots$.pipe(
            take(1),
            switchMap((slots) => this._httpClient.put<Slot>('/api/slots/' + id, data).pipe(
                map((updatedSlot) => {

                    // Find and replace updated slot
                    const index = slots.findIndex(item => item.id === id);
                    slots[index] = updatedSlot;
                    this._slots.next(slots);

                    // Update slot
                    this._slot.next(updatedSlot);

                    return updatedSlot;
                })
            ))
        )
    }

    deleteSlot(id: string): Observable<boolean> {
        return this.slots$.pipe(
            take(1),
            switchMap(slots => this._httpClient.delete('/api/slots/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = slots.findIndex(item => item.id === id);

                    // Delete the product
                    slots.splice(index, 1);

                    // Update the slots
                    this._slots.next(slots);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}