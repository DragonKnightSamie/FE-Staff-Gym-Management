import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Member } from 'app/types/member.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MemberService {

    private _member: BehaviorSubject<Member | null> = new BehaviorSubject(null);
    private _members: BehaviorSubject<Member[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for member
 */
    get member$(): Observable<Member> {
        return this._member.asObservable();
    }

    /**
     * Getter for members
     */
    get members$(): Observable<Member[]> {
        return this._members.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getMembers(filter: any = {}):
        Observable<{ pagination: Pagination; data: Member[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Member[] }>('/api/members/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._members.next(response.data);
            }),
        );
    }

    /**
     * Get member by id
     */
    getMemberById(id: string): Observable<Member> {
        return this.members$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Member>('/api/members/' + id).pipe(
                map((member) => {

                    // Set value for current member
                    this._member.next(member);

                    // Return the new contact
                    return member;
                })
            ))
        );
    }

    /**
* Create member
*/
    createMember(data) {
        return this.members$.pipe(
            take(1),
            switchMap((members) => this._httpClient.post<Member>('/api/members', data).pipe(
                map((newMember) => {

                    // Update member list with current page size
                    this._members.next([newMember, ...members].slice(0, this._pagination.value.pageSize));

                    return newMember;
                })
            ))
        )
    }

    /**
    * Update member
    */
    updateMember(id: string, data) {
        return this.members$.pipe(
            take(1),
            switchMap((members) => this._httpClient.put<Member>('/api/members/' + id, data).pipe(
                map((updatedMember) => {

                    // Find and replace updated member
                    const index = members.findIndex(item => item.id === id);
                    members[index] = updatedMember;
                    this._members.next(members);

                    // Update member
                    this._member.next(updatedMember);

                    return updatedMember;
                })
            ))
        )
    }

    deleteMember(id: string): Observable<boolean> {
        return this.members$.pipe(
            take(1),
            switchMap(members => this._httpClient.delete('/api/members/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = members.findIndex(item => item.id === id);

                    // Delete the product
                    members.splice(index, 1);

                    // Update the members
                    this._members.next(members);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}