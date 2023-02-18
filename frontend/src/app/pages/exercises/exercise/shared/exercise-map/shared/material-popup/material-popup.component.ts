import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import type { Material, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import { createSelectMaterial } from 'src/app/state/application/selectors/exercise.selectors';
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

    constructor(private readonly storeService: StoreService) {}

    ngOnInit(): void {
        this.material$ = this.storeService.select$(
            createSelectMaterial(this.materialId)
        );
    }
}
