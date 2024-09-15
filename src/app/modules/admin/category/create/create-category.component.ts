import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CategoryService } from '../category.service';

@Component({
    selector: 'create-category',
    standalone: true,
    templateUrl: './create-category.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule]
})
export class CreateCategoryComponent implements OnInit {

    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    createCategoryForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CreateCategoryComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _categoryService: CategoryService
    ) { }

    ngOnInit(): void {
        this.initCategoryForm();
    }

    initCategoryForm() {
        this.createCategoryForm = this._formBuilder.group({
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

    createCategory() {
        if (this.createCategoryForm.valid) {
            if (this.selectedFile) {
                const formData = new FormData();
                formData.append('thumbnail', this.selectedFile);
                for (const key in this.createCategoryForm.controls) {
                    if (this.createCategoryForm.controls.hasOwnProperty(key)) {
                        formData.append(key, this.createCategoryForm.controls[key].value);
                    }
                }
                this._categoryService.createCategory(formData).subscribe({
                    next: (category) => {
                        if (category) {
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
