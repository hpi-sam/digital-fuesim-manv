import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Personnel } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { getSelectPersonnel } from 'src/app/state/application/selectors/exercise.selectors';
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

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.personnel$ = this.store.select(
            getSelectPersonnel(this.personnelId)
        );
    }
}
