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
import { Member } from 'app/types/member.type';
import { MemberService } from '../member.service';
import { ageValidator } from '@fuse/validators/age/age.validator';

@Component({
    selector: 'member-detail',
    standalone: true,
    templateUrl: './member-detail.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule,
        ReactiveFormsModule, MatInputModule, MatDatepickerModule, MatSelectModule]
})
export class MemberDetailComponent implements OnInit {
    member: Member;
    previewUrl: string | ArrayBuffer;
    selectedFile: File;
    uploadMessage: string;
    updateMemberForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<MemberDetailComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _memberService: MemberService
    ) { }

    ngOnInit(): void {
        this._memberService.member$.subscribe(member => {
            this.member = member;
            this.previewUrl = member.avatarUrl;
            this.initMemberForm();
        });
    }

    initMemberForm() {
        this.updateMemberForm = this._formBuilder.group({
            name: [this.member.name, [Validators.required]],
            phone: [this.member.phone, [Validators.required, Validators.pattern('^(03|05|07|08|09)[0-9]{8}$')]],
            dateOfBirth: [this.member.dateOfBirth, [Validators.required, ageValidator(13)]],
            email: [{ value: this.member.email, disabled: true }],
            status: [this.member.status, [Validators.required]],
            gender: [this.member.gender || 'Male', [Validators.required]],
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

    updateMember() {
        console.log(this.updateMemberForm.value);

        if (this.updateMemberForm.valid) {
            const formData = new FormData();
            for (const key in this.updateMemberForm.controls) {
                if (this.updateMemberForm.controls.hasOwnProperty(key)) {
                    formData.append(key, this.updateMemberForm.controls[key].value);
                }
            }
            if (this.selectedFile) {
                formData.append('avatar', this.selectedFile);
            }
            this._memberService.updateMember(this.member.id, formData).subscribe({
                next: (member) => {
                    if (member) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }

    onMemberStatusChange(event: any) {
        this.updateMemberForm.controls['status'].setValue(event.value);
    }

    onMemberGenderChange(event: any) {
        this.updateMemberForm.controls['gender'].setValue(event.value);
    }
}
