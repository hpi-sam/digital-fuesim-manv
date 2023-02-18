import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import type { Personnel, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import { createSelectPersonnel } from 'src/app/state/application/selectors/exercise.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

@Component({
    selector: 'app-personnel-popup',
    templateUrl: './personnel-popup.component.html',
    styleUrls: ['./personnel-popup.component.scss'],
})
export class PersonnelPopupComponent implements PopupComponent, OnInit {
    public personnelId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public personnel$?: Observable<Personnel>;

    constructor(private readonly storeService: StoreService) {}

    ngOnInit(): void {
        this.personnel$ = this.storeService.select$(
            createSelectPersonnel(this.personnelId)
        );
    }
}
