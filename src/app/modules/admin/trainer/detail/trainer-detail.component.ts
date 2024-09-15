import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Trainer } from 'app/types/trainer.type';
import { TrainerService } from '../trainer.service';
import { ageValidator } from '@fuse/validators/age/age.validator';

@Component({
    selector: 'trainer-detail',
    standalone: true,
    templateUrl: './trainer-detail.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule,
        ReactiveFormsModule, MatInputModule, MatDatepickerModule, MatSelectModule]
})
export class TrainerDetailComponent implements OnInit {
    trainer: Trainer;
    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    updateTrainerForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<TrainerDetailComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _trainerService: TrainerService
    ) { }

    ngOnInit(): void {
        this._trainerService.trainer$.subscribe(trainer => {
            this.trainer = trainer;
            this.previewUrl = trainer.avatarUrl;
            this.initTrainerForm();
        });
    }

    initTrainerForm() {
        this.updateTrainerForm = this._formBuilder.group({
            name: [this.trainer.name, [Validators.required]],
            phone: [this.trainer.phone, Validators.pattern('^(03|05|07|08|09)[0-9]{8}$')],
            dateOfBirth: [this.trainer.dateOfBirth, [Validators.required, ageValidator(18)]],
            email: [{ value: this.trainer.email, disabled: true }],
            status: [this.trainer.status, [Validators.required]],
            gender: [this.trainer.gender, [Validators.required]],
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

    updateTrainer() {
        console.log(this.updateTrainerForm.value);

        if (this.updateTrainerForm.valid) {
            const formData = new FormData();
            for (const key in this.updateTrainerForm.controls) {
                if (this.updateTrainerForm.controls.hasOwnProperty(key)) {
                    formData.append(key, this.updateTrainerForm.controls[key].value);
                }
            }
            if (this.selectedFile) {
                formData.append('avatar', this.selectedFile);
            }
            this._trainerService.updateTrainer(this.trainer.id, formData).subscribe({
                next: (trainer) => {
                    if (trainer) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }

    onTrainerStatusChange() {
        this.initTrainerForm();
    }

    onTrainerGenderChange() {
        this.initTrainerForm();
    }
}
