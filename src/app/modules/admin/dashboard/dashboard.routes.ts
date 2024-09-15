import { Routes } from '@angular/router';
import { DashboardComponent } from 'app/modules/admin/dashboard/dashboard.component';
import { DashboardService } from './dashboard.service';
import { inject } from '@angular/core';

export default [
    {
        path: '',
        component: DashboardComponent,
        resolve: {
            data: () => inject(DashboardService).getData(),
        }
    },
] as Routes;
