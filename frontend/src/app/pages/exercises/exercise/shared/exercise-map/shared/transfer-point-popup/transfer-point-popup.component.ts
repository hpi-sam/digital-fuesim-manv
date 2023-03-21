import type { OnInit } from '@angular/core';
import {
    Component,
    EventEmitter,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import type { TransferPoint, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import { createSelectTransferPoint } from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

type NavIds = 'hospitals' | 'names' | 'transferPoints';
/**
 * We want to remember the last selected nav item, so the user doesn't have to manually select it again.
 */
let activeNavId: NavIds = 'names';

@Component({
    selector: 'app-transfer-point-popup',
    templateUrl: './transfer-point-popup.component.html',
    styleUrls: ['./transfer-point-popup.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TransferPointPopupComponent implements PopupComponent, OnInit {
    // These properties are only set after OnInit
    public transferPointId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public transferPoint$?: Observable<TransferPoint>;

    public readonly currentRole$ = this.storeService.select$(selectCurrentRole);

    public get activeNavId() {
        return activeNavId;
    }
    public set activeNavId(value: NavIds) {
        activeNavId = value;
    }

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly storeService: StoreService
    ) {}

    ngOnInit() {
        this.transferPoint$ = this.storeService.select$(
            createSelectTransferPoint(this.transferPointId)
        );
    }

    public renameTransferPoint({
        internalName,
        externalName,
    }: {
        internalName?: string;
        externalName?: string;
    }) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Rename TransferPoint',
            transferPointId: this.transferPointId,
            internalName,
            externalName,
        });
    }
}
