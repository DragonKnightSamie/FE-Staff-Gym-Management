import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { EquipmentComponent } from 'app/modules/admin/equipment/equipment.component';
import { EquipmentService } from './equipment.service';

export default [
    {
        path: '',
        component: EquipmentComponent,
        resolve: {
            equipment: () => inject(EquipmentService).getEquipments(),
        }
    },
] as Routes;
