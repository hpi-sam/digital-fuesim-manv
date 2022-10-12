import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Material } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { getSelectMaterial } from 'src/app/state/application/selectors/exercise.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

@Component({
    selector: 'app-material-popup',
    templateUrl: './material-popup.component.html',
    styleUrls: ['./material-popup.component.scss'],
})
export class MaterialPopupComponent implements PopupComponent, OnInit {
    public materialId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public material$?: Observable<Material>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.material$ = this.store.select(getSelectMaterial(this.materialId));
    }
}
