import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from 'app/types/category.type';
import { Observable } from 'rxjs';
import { CategoryService } from '../../category/category.service';
import { CourseService } from '../course.service';

@Component({
    selector: 'create-course',
    standalone: true,
    templateUrl: './create-course.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule]
})
export class CreateCourseComponent implements OnInit {

    categories$: Observable<Category[]>;
    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    createCourseForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CreateCourseComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _courseService: CourseService,
        private _categoryService: CategoryService,
    ) { }

    ngOnInit(): void {
        this.categories$ = this._categoryService.categories$;
        this.initCourseForm();
    }

    initCourseForm() {
        this.createCourseForm = this._formBuilder.group({
            name: [null, [Validators.required]],
            description: [null, [Validators.required]],
            categoryId: [null, [Validators.required]],
            totalSlot: [null, [Validators.required]],
            totalMember: [null, [Validators.required]],
            lessonTime: [null, [Validators.required]],
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

    createCourse() {
        if (this.createCourseForm.valid) {
            if (this.selectedFile) {
                const formData = new FormData();
                formData.append('thumbnail', this.selectedFile);
                for (const key in this.createCourseForm.controls) {
                    if (this.createCourseForm.controls.hasOwnProperty(key)) {
                        formData.append(key, this.createCourseForm.controls[key].value);
                    }
                }
                this._courseService.createCourse(formData).subscribe({
                    next: (course) => {
                        if (course) {
                            this.matDialogRef.close('success');
                        }
                    }
                });
            } else {
                this.uploadMessage = 'Please chose a picture!';
            }
        }
    }

    onCourseCategoryChange(event: any) {
        this.createCourseForm.controls['categoryId'].setValue(event.value);
    }

}
