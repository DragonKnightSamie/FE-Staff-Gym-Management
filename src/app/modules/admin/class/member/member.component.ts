import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FuseCardComponent } from '@fuse/components/card';
import { ClassMember } from 'app/types/class-member.type';
import { Wishlist } from 'app/types/wishlist.type';
import { Observable } from 'rxjs';
import { WishlistService } from '../../wishlist/wishlist.service';
import { ClassService } from '../class.service';
import { CommonModule } from '@angular/common';
import { environment } from 'environments/environment.prod';
import { MatButtonModule } from '@angular/material/button';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'member',
    templateUrl: './member.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule, FuseCardComponent, MatButtonModule]
})
export class MemberComponent implements OnInit {

    environment: any;
    classMembers$: Observable<ClassMember[]>;
    wishlists$: Observable<Wishlist[]>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { classId: string },
        public matDialogRef: MatDialogRef<MemberComponent>,
        private _wishlistService: WishlistService,
        private _classService: ClassService,
        private _fuseConfirmationService: FuseConfirmationService
    ) { }

    ngOnInit(): void {
        this.environment = environment;
        this.classMembers$ = this._classService.classMembers$;
        this.wishlists$ = this._wishlistService.wishlists$;
    }

    addMember(memberId: string, wishlistId: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._classService.addMember(memberId, this.data.classId).subscribe(() => {
                    this._wishlistService.deleteWishlist(wishlistId).subscribe();
                });
            }
        })
    }

    removeFromWishlist(id: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._wishlistService.deleteWishlist(id).subscribe();
            }
        })
    }
}
