import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Equipment } from 'app/types/equipment.type';
import { EquipmentService } from '../equipment.service';

@Component({
    selector: 'equipment-detail',
    standalone: true,
    templateUrl: './equipment-detail.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule]
})
export class EquipmentDetailComponent implements OnInit {
    equipment: Equipment;
    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    updateEquipmentForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<EquipmentDetailComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _equipmentService: EquipmentService
    ) { }

    ngOnInit(): void {
        this._equipmentService.equipment$.subscribe(equipment => {
            this.equipment = equipment;
            this.previewUrl = equipment.thumbnailUrl;
            this.initEquipmentForm();
        });
    }

    initEquipmentForm() {
        this.updateEquipmentForm = this._formBuilder.group({
            name: [this.equipment.name, [Validators.required]],
            description: [this.equipment.description, [Validators.required]],
            status: [this.equipment.status, [Validators.required]]
        });
    }

    onFileSelected(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrl = e.target?.result;
            };
            reader.readAsDataURL(file);
        }
    }

    updateEquipment() {
        if (this.updateEquipmentForm.valid) {
            const formData = new FormData();
            for (const key in this.updateEquipmentForm.controls) {
                if (this.updateEquipmentForm.controls.hasOwnProperty(key)) {
                    formData.append(key, this.updateEquipmentForm.controls[key].value);
                }
            }
            if (this.selectedFile) {
                formData.append('thumbnail', this.selectedFile);
            }
            this._equipmentService.updateEquipment(this.equipment.id, formData).subscribe({
                next: (equipment) => {
                    if (equipment) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }

    onEquipmentStatusChange(event: any) {
        this.updateEquipmentForm.controls['status'].setValue(event.value);
    }
}
