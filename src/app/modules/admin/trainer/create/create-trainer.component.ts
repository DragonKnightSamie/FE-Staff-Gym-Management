import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TrainerService } from '../trainer.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { ageValidator } from '@fuse/validators/age/age.validator';


@Component({
    selector: 'create-trainer',
    standalone: true,
    templateUrl: './create-trainer.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule,
        ReactiveFormsModule, MatInputModule, MatDatepickerModule, MatSelectModule]
})
export class CreateTrainerComponent implements OnInit {

    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    createTrainerForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CreateTrainerComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _trainerService: TrainerService
    ) { }

    ngOnInit(): void {
        this.initTrainerForm();
    }

    initTrainerForm() {
        this.createTrainerForm = this._formBuilder.group({
            name: [null, [Validators.required]],
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required]],
            dateOfBirth: [null, [Validators.required, ageValidator(18)]],
            gender: ['Male', [Validators.required]],
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

    createTrainer() {
        console.log(this.createTrainerForm.value);

        if (this.createTrainerForm.valid) {
            const formData = new FormData();
            for (const key in this.createTrainerForm.controls) {
                if (this.createTrainerForm.controls.hasOwnProperty(key)) {
                    formData.append(key, this.createTrainerForm.controls[key].value);
                }
            }
            if (this.selectedFile) {
                formData.append('avatar', this.selectedFile);
            }
            this._trainerService.createTrainer(formData).subscribe({
                next: (trainer) => {
                    if (trainer) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }

    onTrainerGenderChange(event: any) {
        console.log(event);

        this.createTrainerForm.controls['gender'].setValue(event.value);
    }

}
