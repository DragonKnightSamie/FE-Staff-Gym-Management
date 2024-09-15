import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { CategoryComponent } from 'app/modules/admin/category/category.component';
import { CategoryService } from './category.service';

export default [
    {
        path: '',
        component: CategoryComponent,
        resolve: {
            category: () => inject(CategoryService).getCategories(),
        }
    },
] as Routes;
