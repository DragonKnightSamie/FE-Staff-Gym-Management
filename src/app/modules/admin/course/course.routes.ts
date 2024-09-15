import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { CourseComponent } from 'app/modules/admin/course/course.component';
import { CourseService } from './course.service';

export default [
    {
        path: '',
        component: CourseComponent,
        resolve: {
            course: () => inject(CourseService).getCourses(),
        }
    },
] as Routes;
