import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { StaffService } from '../staff.service';

@Component({
    selector: 'create-staff',
    standalone: true,
    templateUrl: './create-staff.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule]
})
export class CreateStaffComponent implements OnInit {

    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    createStaffForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CreateStaffComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _staffService: StaffService
    ) { }

    ngOnInit(): void {
        this.initStaffForm();
    }

    initStaffForm() {
        this.createStaffForm = this._formBuilder.group({
            name: [null, [Validators.required]],
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required]],
            phone: [null, [Validators.required, Validators.pattern('^(03|05|07|08|09)[0-9]{8}$')]],
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

    createStaff() {
        if (this.createStaffForm.valid) {
            const formData = new FormData();
            for (const key in this.createStaffForm.controls) {
                if (this.createStaffForm.controls.hasOwnProperty(key)) {
                    formData.append(key, this.createStaffForm.controls[key].value);
                }
            }
            if (this.selectedFile) {
                formData.append('avatar', this.selectedFile);
            }
            this._staffService.createStaff(formData).subscribe({
                next: (staff) => {
                    if (staff) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }

}
