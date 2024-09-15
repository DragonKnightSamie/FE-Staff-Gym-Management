import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { StaffComponent } from 'app/modules/admin/staff/staff.component';
import { StaffService } from './staff.service';

export default [
    {
        path: '',
        component: StaffComponent,
        resolve: {
            staff: () => inject(StaffService).getStaffs(),
        }
    },
] as Routes;
