import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Inquiry } from 'app/types/inquiry.type';
import { InquiryService } from '../inquiry.service';
import { environment } from 'environments/environment.prod';
import { FuseAlertComponent } from '@fuse/components/alert';

@Component({
    selector: 'inquiry-detail',
    standalone: true,
    templateUrl: './inquiry-detail.component.html',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule,
        ReactiveFormsModule, MatInputModule, MatSelectModule, FuseAlertComponent]
})
export class InquiryDetailComponent implements OnInit {
    environment = environment;
    inquiry: Inquiry;
    uploadMessage: string;
    updateInquiryForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<InquiryDetailComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _inquiryService: InquiryService
    ) { }

    ngOnInit(): void {
        this._inquiryService.inquiry$.subscribe(inquiry => {
            this.inquiry = inquiry;
            this.initInquiryForm();
        });
    }

    initInquiryForm() {
        const disabled = this.inquiry.inquiryResponse;
        this.updateInquiryForm = this._formBuilder.group({
            title: [{ value: this.inquiry.title, disabled: true }, [Validators.required]],
            message: [{ value: this.inquiry.inquiryResponse, disabled: disabled }, [Validators.required]],
        });
    }

    acceptInquiry() {
        if (this.updateInquiryForm.valid) {
            this._inquiryService.acceptInquiry(this.inquiry.id, this.updateInquiryForm.value).subscribe({
                next: (inquiry) => {
                    if (inquiry) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }


    rejectInquiry() {
        if (this.updateInquiryForm.valid) {
            this._inquiryService.rejectInquiry(this.inquiry.id, this.updateInquiryForm.value).subscribe({
                next: (inquiry) => {
                    if (inquiry) {
                        this.matDialogRef.close('success');
                    }
                }
            });
        }
    }
}
