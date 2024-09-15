import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ClassComponent } from 'app/modules/admin/class/class.component';
import { ClassResolver } from './class.resolvers';
import { ClassService } from './class.service';
import { ClassDetailComponent } from './detail/class-detail.component';

export default [
    {
        path: '',
        component: ClassComponent,
        resolve: {
            class: () => inject(ClassService).getClasses(),
        }
    },
    {
        path: ':id',
        component: ClassDetailComponent,
        resolve: {
            data: ClassResolver
        }
    },
] as Routes;
