import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Inquiry } from 'app/types/inquiry.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InquiryService {

    private _inquiry: BehaviorSubject<Inquiry | null> = new BehaviorSubject(null);
    private _inquiries: BehaviorSubject<Inquiry[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for inquiry
 */
    get inquiry$(): Observable<Inquiry> {
        return this._inquiry.asObservable();
    }

    /**
     * Getter for inquiries
     */
    get inquiries$(): Observable<Inquiry[]> {
        return this._inquiries.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getInquiries(filter: any = {}):
        Observable<{ pagination: Pagination; data: Inquiry[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Inquiry[] }>('/api/inquiries/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._inquiries.next(response.data);
            }),
        );
    }

    /**
     * Get inquiry by id
     */
    getInquiryById(id: string): Observable<Inquiry> {
        return this.inquiries$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Inquiry>('/api/inquiries/' + id).pipe(
                map((inquiry) => {

                    // Set value for current inquiry
                    this._inquiry.next(inquiry);

                    // Return the new contact
                    return inquiry;
                })
            ))
        );
    }

    /**
* Create inquiry
*/
    createInquiry(data) {
        return this.inquiries$.pipe(
            take(1),
            switchMap((inquiries) => this._httpClient.post<Inquiry>('/api/inquiries', data).pipe(
                map((newInquiry) => {

                    // Update inquiry list with current page size
                    this._inquiries.next([newInquiry, ...inquiries].slice(0, this._pagination.value.pageSize));

                    return newInquiry;
                })
            ))
        )
    }

    /**
    * Update inquiry
    */
    updateInquiry(id: string, data) {
        return this.inquiries$.pipe(
            take(1),
            switchMap((inquiries) => this._httpClient.put<Inquiry>('/api/inquiries/' + id, data).pipe(
                map((updatedInquiry) => {

                    // Find and replace updated inquiry
                    const index = inquiries.findIndex(item => item.id === id);
                    inquiries[index] = updatedInquiry;
                    this._inquiries.next(inquiries);

                    // Update inquiry
                    this._inquiry.next(updatedInquiry);

                    return updatedInquiry;
                })
            ))
        )
    }

    /**
* Update inquiry
*/
    acceptInquiry(id: string, data) {
        return this.inquiries$.pipe(
            take(1),
            switchMap((inquiries) => this._httpClient.put<Inquiry>('/api/inquiry-responses/' + id + '/accept', data).pipe(
                map((updatedInquiry) => {

                    // Find and replace updated inquiry
                    const index = inquiries.findIndex(item => item.id === id);
                    inquiries[index] = updatedInquiry;
                    this._inquiries.next(inquiries);

                    // Update inquiry
                    this._inquiry.next(updatedInquiry);

                    return updatedInquiry;
                })
            ))
        )
    }

    /**
* Update inquiry
*/
    rejectInquiry(id: string, data) {
        return this.inquiries$.pipe(
            take(1),
            switchMap((inquiries) => this._httpClient.put<Inquiry>('/api/inquiry-responses/' + id + '/reject', data).pipe(
                map((updatedInquiry) => {

                    // Find and replace updated inquiry
                    const index = inquiries.findIndex(item => item.id === id);
                    inquiries[index] = updatedInquiry;
                    this._inquiries.next(inquiries);

                    // Update inquiry
                    this._inquiry.next(updatedInquiry);

                    return updatedInquiry;
                })
            ))
        )
    }

    deleteInquiry(id: string): Observable<boolean> {
        return this.inquiries$.pipe(
            take(1),
            switchMap(inquiries => this._httpClient.delete('/api/inquiries/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = inquiries.findIndex(item => item.id === id);

                    // Delete the product
                    inquiries.splice(index, 1);

                    // Update the inquiries
                    this._inquiries.next(inquiries);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}