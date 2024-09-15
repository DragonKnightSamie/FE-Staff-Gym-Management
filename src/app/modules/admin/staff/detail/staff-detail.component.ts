import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Staff } from 'app/types/staff.type';
import { StaffService } from '../staff.service';

@Component({
    selector: 'staff-detail',
    standalone: true,
    templateUrl: './staff-detail.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule]
})
export class StaffDetailComponent implements OnInit {
    staff: Staff;
    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    updateStaffForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<StaffDetailComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _staffService: StaffService
    ) { }

    ngOnInit(): void {
        this._staffService.staff$.subscribe(staff => {
            this.staff = staff;
            this.previewUrl = staff.avatarUrl;
            this.initStaffForm();
        });
    }

    initStaffForm() {
        this.updateStaffForm = this._formBuilder.group({
            name: [this.staff.name, [Validators.required]],
            phone: [this.staff.phone, Validators.pattern('^(03|05|07|08|09)[0-9]{8}$')],
            email: [{ value: this.staff.email, disabled: true }],
            status: [this.staff.status, [Validators.required]]
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

    updateStaff() {
        if (this.updateStaffForm.valid) {
            const formData = new FormData();
            for (const key in this.updateStaffForm.controls) {
                if (this.updateStaffForm.controls.hasOwnProperty(key)) {
                    formData.append(key, this.updateStaffForm.controls[key].value);
                }
            }
            if (this.selectedFile) {
                formData.append('avatar', this.selectedFile);
            }
            this._staffService.updateStaff(this.staff.id, formData).subscribe({
                next: (staff) => {
                    if (staff) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }

    onStaffStatusChange() {
        this.initStaffForm()
    }
}
