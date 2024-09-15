import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClassMember } from 'app/types/class-member.type';
import { Class } from 'app/types/class.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClassService {

    private _class: BehaviorSubject<Class | null> = new BehaviorSubject(null);
    private _classes: BehaviorSubject<Class[] | null> = new BehaviorSubject(null);
    private _classMembers: BehaviorSubject<ClassMember[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);


    constructor(
        private _httpClient: HttpClient,
    ) { }

    /**
 * Getter for class
 */
    get class$(): Observable<Class> {
        return this._class.asObservable();
    }

    /**
     * Getter for classes
     */
    get classes$(): Observable<Class[]> {
        return this._classes.asObservable();
    }

    /**
 * Getter for class members
 */
    get classMembers$(): Observable<ClassMember[]> {
        return this._classMembers.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getClasses(filter: any = {}):
        Observable<{ pagination: Pagination; data: Class[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Class[] }>('/api/classes/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._classes.next(response.data);
            }),
        );
    }

    getClassMembers(classId: string):
        Observable<{ pagination: Pagination; data: ClassMember[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: ClassMember[] }>('/api/class-members/filter', { classId: classId }).pipe(
            tap((response) => {
                this._classMembers.next(response.data);
            }),
        );
    }

    /**
     * Get class by id
     */
    getClassById(id: string): Observable<Class> {
        return this.classes$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Class>('/api/classes/' + id).pipe(
                map((cl) => {

                    // Set value for current class
                    this._class.next(cl);

                    // Return the new contact
                    return cl;
                })
            ))
        );
    }

    /**
* Create class
*/
    createClass(courseId, data) {
        return this.classes$.pipe(
            take(1),
            switchMap((classes) => this._httpClient.post<Class>('/api/classes/' + courseId, data).pipe(
                map((newClass) => {

                    // Update class list with current page size
                    this._classes.next([newClass, ...classes].slice(0, this._pagination.value.pageSize));

                    return newClass;
                })
            ))
        )
    }

    haha(courseId, data) {
        return this.classes$.pipe(take(1), switchMap((classes) => {
            return this._httpClient.post<Class>('/api/classes/' + courseId, data).pipe(map((newClass) => {
                return newClass;
            }))
        }))
    }

    /**
    * Update class
    */
    updateClass(id: string, data) {
        return this.classes$.pipe(
            take(1),
            switchMap((classes) => this._httpClient.put<Class>('/api/classes/' + id, data).pipe(
                map((updatedClass) => {

                    // Find and replace updated class
                    const index = classes.findIndex(item => item.id === id);
                    classes[index] = updatedClass;
                    this._classes.next(classes);

                    // Update class
                    this._class.next(updatedClass);

                    return updatedClass;
                })
            ))
        )
    }

    deleteClass(id: string): Observable<boolean> {
        return this.classes$.pipe(
            take(1),
            switchMap(classes => this._httpClient.delete('/api/classes/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = classes.findIndex(item => item.id === id);

                    // Delete the product
                    classes.splice(index, 1);

                    // Update the classes
                    this._classes.next(classes);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }

    addMember(memberId: string, classId: string) {
        return this.classMembers$.pipe(
            take(1),
            switchMap((classMembers) => this._httpClient.post<ClassMember>('/api/class-members/' + memberId + '/add-member', { classId: classId }).pipe(
                map((newClassMember) => {
                    this._classMembers.next([newClassMember, ...classMembers]);
                    return newClassMember;
                })
            ))
        )
    }

    mapObjects(slots: any[], datePipe: DatePipe): any[] {
        return slots.map(slot => {
            const formattedStartTime = datePipe.transform(slot.startTime, 'shortTime');
            const formattedEndTime = datePipe.transform(slot.endTime, 'shortTime');
            const formattedDate = datePipe.transform(slot.startTime, 'yyyy-MM-dd');
            return {
                publicId: slot.id,
                title: `${slot.name} (${formattedStartTime} - ${formattedEndTime})`,
                date: formattedDate
            };
        });
    }
}