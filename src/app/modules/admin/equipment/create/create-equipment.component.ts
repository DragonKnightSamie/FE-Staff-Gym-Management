import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EquipmentService } from '../equipment.service';

@Component({
    selector: 'create-equipment',
    standalone: true,
    templateUrl: './create-equipment.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule]
})
export class CreateEquipmentComponent implements OnInit {

    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    createEquipmentForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CreateEquipmentComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _equipmentService: EquipmentService
    ) { }

    ngOnInit(): void {
        this.initEquipmentForm();
    }

    initEquipmentForm() {
        this.createEquipmentForm = this._formBuilder.group({
            name: [null, [Validators.required]],
            description: [null, [Validators.required]]
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

    createEquipment() {
        if (this.createEquipmentForm.valid) {
            if (this.selectedFile) {
                const formData = new FormData();
                formData.append('thumbnail', this.selectedFile);
                for (const key in this.createEquipmentForm.controls) {
                    if (this.createEquipmentForm.controls.hasOwnProperty(key)) {
                        formData.append(key, this.createEquipmentForm.controls[key].value);
                    }
                }
                this._equipmentService.createEquipment(formData).subscribe({
                    next: (equipment) => {
                        if (equipment) {
                            this.matDialogRef.close('success');
                        }
                    }
                });
            } else {
                this.uploadMessage = 'Please chose a picture!';
            }
        }
    }

}
