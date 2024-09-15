import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { InquiryComponent } from 'app/modules/admin/inquiry/inquiry.component';
import { InquiryService } from './inquiry.service';

export default [
    {
        path: '',
        component: InquiryComponent,
        resolve: {
            inquiry: () => inject(InquiryService).getInquiries(),
        }
    },
] as Routes;
