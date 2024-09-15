import { Injectable } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ErrorService {

    private errorSubject = new Subject<string>();

    constructor(
        private _fuseConfirmationService: FuseConfirmationService
    ) { }

    error$ = this.errorSubject.asObservable();

    showServerError(message: string) {
        this.errorSubject.next(message);
        this._fuseConfirmationService.open({
            title: 'Internal Server Error',
            message: message,
            actions: {
                cancel: {
                    show: false
                }
            }
        });
    }

    showConflictError(message: string) {
        this.errorSubject.next(message);
        this._fuseConfirmationService.open({
            title: 'Conflict',
            message: message,
            icon: {
                color: 'primary',
            },
            actions: {
                confirm: {
                    color: 'primary'
                },
                cancel: {
                    show: false
                }
            }
        });
    }
}