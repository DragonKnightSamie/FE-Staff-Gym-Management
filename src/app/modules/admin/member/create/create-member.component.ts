import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MemberService } from '../member.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { ageValidator } from '@fuse/validators/age/age.validator';


@Component({
    selector: 'create-member',
    standalone: true,
    templateUrl: './create-member.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule,
        ReactiveFormsModule, MatInputModule, MatDatepickerModule, MatSelectModule]
})
export class CreateMemberComponent implements OnInit {

    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    createMemberForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CreateMemberComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _memberService: MemberService
    ) { }

    ngOnInit(): void {
        this.initMemberForm();
    }

    initMemberForm() {
        this.createMemberForm = this._formBuilder.group({
            name: [null, [Validators.required]],
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required]],
            dateOfBirth: [null, [Validators.required, ageValidator(13)]],
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

    createMember() {
        console.log(this.createMemberForm.value);

        if (this.createMemberForm.valid) {
            const formData = new FormData();
            for (const key in this.createMemberForm.controls) {
                if (this.createMemberForm.controls.hasOwnProperty(key)) {
                    formData.append(key, this.createMemberForm.controls[key].value);
                }
            }
            if (this.selectedFile) {
                formData.append('avatar', this.selectedFile);
            }
            this._memberService.createMember(formData).subscribe({
                next: (member) => {
                    if (member) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }

    onMemberGenderChange(event: any) {
        console.log(event);

        this.createMemberForm.controls['gender'].setValue(event.value);
    }

}
