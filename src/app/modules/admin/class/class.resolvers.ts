import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SlotService } from '../slot/slot.service';
import { ClassService } from './class.service';
import { CourseService } from '../course/course.service';

@Injectable({
    providedIn: 'root',
})
export class ClassResolver implements Resolve<any> {
    constructor(private _classService: ClassService, private _courseService: CourseService, private slotService: SlotService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const classId = route.params['id'];
        return this._classService.getClassById(classId).pipe(
            switchMap(() =>
                this.slotService.getSlots({ classId: classId, pagination: { pageSize: 999 } }).pipe(
                    switchMap(() => {
                        return this._courseService.getCourseByClassId(classId).pipe(
                            map(course => ({
                                course
                            }))
                        );
                    })
                )
            )
        );
    }

}
