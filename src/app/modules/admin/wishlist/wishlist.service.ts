import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Wishlist } from 'app/types/wishlist.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {

    private _wishlist: BehaviorSubject<Wishlist | null> = new BehaviorSubject(null);
    private _wishlists: BehaviorSubject<Wishlist[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for wishlist
 */
    get wishlist$(): Observable<Wishlist> {
        return this._wishlist.asObservable();
    }

    /**
     * Getter for wishlists
     */
    get wishlists$(): Observable<Wishlist[]> {
        return this._wishlists.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getCourseWishlists(classId: string):
        Observable<{ pagination: Pagination; data: Wishlist[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Wishlist[] }>('/api/wishlists/filter', { classId: classId }).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._wishlists.next(response.data);
            }),
        );
    }

    /**
     * Get wishlist by id
     */
    getWishlistById(id: string): Observable<Wishlist> {
        return this.wishlists$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Wishlist>('/api/wishlists/' + id).pipe(
                map((wishlist) => {

                    // Set value for current wishlist
                    this._wishlist.next(wishlist);

                    // Return the new contact
                    return wishlist;
                })
            ))
        );
    }

    /**
 * Get wishlist by class id
 */
    getWishlistByClassId(id: string): Observable<Wishlist> {
        return this.wishlists$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Wishlist>('/api/wishlists/classes/' + id).pipe(
                map((wishlist) => {

                    // Set value for current wishlist
                    this._wishlist.next(wishlist);

                    // Return the new contact
                    return wishlist;
                })
            ))
        );
    }

    /**
* Create wishlist
*/
    createWishlist(data) {
        return this.wishlists$.pipe(
            take(1),
            switchMap((wishlists) => this._httpClient.post<Wishlist>('/api/wishlists', data).pipe(
                map((newWishlist) => {

                    // Update wishlist list with current page size
                    this._wishlists.next([newWishlist, ...wishlists].slice(0, this._pagination.value.pageSize));

                    return newWishlist;
                })
            ))
        )
    }

    /**
    * Update wishlist
    */
    updateWishlist(id: string, data) {
        return this.wishlists$.pipe(
            take(1),
            switchMap((wishlists) => this._httpClient.put<Wishlist>('/api/wishlists/' + id, data).pipe(
                map((updatedWishlist) => {

                    // Find and replace updated wishlist
                    const index = wishlists.findIndex(item => item.id === id);
                    wishlists[index] = updatedWishlist;
                    this._wishlists.next(wishlists);

                    // Update wishlist
                    this._wishlist.next(updatedWishlist);

                    return updatedWishlist;
                })
            ))
        )
    }

    deleteWishlist(id: string): Observable<boolean> {
        return this.wishlists$.pipe(
            take(1),
            switchMap(wishlists => this._httpClient.delete('/api/wishlists/' + id + '/remove').pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = wishlists.findIndex(item => item.id === id);

                    // Delete the product
                    wishlists.splice(index, 1);

                    // Update the wishlists
                    this._wishlists.next(wishlists);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}