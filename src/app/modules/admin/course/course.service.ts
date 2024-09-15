import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Course } from 'app/types/course.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CourseService {

    private _course: BehaviorSubject<Course | null> = new BehaviorSubject(null);
    private _courses: BehaviorSubject<Course[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for course
 */
    get course$(): Observable<Course> {
        return this._course.asObservable();
    }

    /**
     * Getter for courses
     */
    get courses$(): Observable<Course[]> {
        return this._courses.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getCourses(filter: any = {}):
        Observable<{ pagination: Pagination; data: Course[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Course[] }>('/api/courses/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._courses.next(response.data);
            }),
        );
    }

    /**
     * Get course by id
     */
    getCourseById(id: string): Observable<Course> {
        return this.courses$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Course>('/api/courses/' + id).pipe(
                map((course) => {

                    // Set value for current course
                    this._course.next(course);

                    // Return the new contact
                    return course;
                })
            ))
        );
    }

    /**
 * Get course by class id
 */
    getCourseByClassId(id: string): Observable<Course> {
        return this.courses$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Course>('/api/courses/classes/' + id).pipe(
                map((course) => {

                    // Set value for current course
                    this._course.next(course);

                    // Return the new contact
                    return course;
                })
            ))
        );
    }

    /**
* Create course
*/
    createCourse(data) {
        return this.courses$.pipe(
            take(1),
            switchMap((courses) => this._httpClient.post<Course>('/api/courses', data).pipe(
                map((newCourse) => {

                    // Update course list with current page size
                    this._courses.next([newCourse, ...courses].slice(0, this._pagination.value.pageSize));

                    return newCourse;
                })
            ))
        )
    }

    /**
    * Update course
    */
    updateCourse(id: string, data) {
        return this.courses$.pipe(
            take(1),
            switchMap((courses) => this._httpClient.put<Course>('/api/courses/' + id, data).pipe(
                map((updatedCourse) => {

                    // Find and replace updated course
                    const index = courses.findIndex(item => item.id === id);
                    courses[index] = updatedCourse;
                    this._courses.next(courses);

                    // Update course
                    this._course.next(updatedCourse);

                    return updatedCourse;
                })
            ))
        )
    }

    deleteCourse(id: string): Observable<boolean> {
        return this.courses$.pipe(
            take(1),
            switchMap(courses => this._httpClient.delete('/api/courses/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = courses.findIndex(item => item.id === id);

                    // Delete the product
                    courses.splice(index, 1);

                    // Update the courses
                    this._courses.next(courses);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}