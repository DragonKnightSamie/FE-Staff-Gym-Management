import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { TrainerComponent } from 'app/modules/admin/trainer/trainer.component';
import { TrainerService } from './trainer.service';

export default [
    {
        path: '',
        component: TrainerComponent,
        resolve: {
            trainer: () => inject(TrainerService).getTrainers(),
        }
    },
] as Routes;
