import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Course } from 'app/types/course.type';
import { CourseService } from '../course.service';
import { Observable } from 'rxjs';
import { Category } from 'app/types/category.type';
import { CategoryService } from '../../category/category.service';

@Component({
    selector: 'course-detail',
    standalone: true,
    templateUrl: './course-detail.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule]
})
export class CourseDetailComponent implements OnInit {

    course: Course;
    categories$: Observable<Category[]>;
    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    updateCourseForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CourseDetailComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _courseService: CourseService,
        private _categoryService: CategoryService,
    ) { }

    ngOnInit(): void {
        this.categories$ = this._categoryService.categories$;
        this._courseService.course$.subscribe(course => {
            this.course = course;
            this.previewUrl = course.thumbnailUrl;
            this.initCourseForm();
        });
    }

    initCourseForm() {
        this.updateCourseForm = this._formBuilder.group({
            name: [this.course.name, [Validators.required]],
            description: [this.course.description, [Validators.required]],
            categoryId: [this.course.category.id, [Validators.required]],
            totalSlot: [this.course.totalSlot, [Validators.required]],
            totalMember: [this.course.totalMember, [Validators.required]],
            lessonTime: [this.course.lessonTime, [Validators.required]],
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

    updateCourse() {
        if (this.updateCourseForm.valid) {
            const formData = new FormData();
            for (const key in this.updateCourseForm.controls) {
                if (this.updateCourseForm.controls.hasOwnProperty(key)) {
                    formData.append(key, this.updateCourseForm.controls[key].value);
                }
            }
            if (this.selectedFile) {
                formData.append('thumbnail', this.selectedFile);
            }
            this._courseService.updateCourse(this.course.id, formData).subscribe({
                next: (course) => {
                    if (course) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }

    onCourseCategoryChange(event: any) {
        this.updateCourseForm.controls['categoryId'].setValue(event.value);
    }
}
