import { Component, Input } from '@angular/core';
import { Transfer, UUID } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import { selectTransferPoints } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-transfer-target-input',
    templateUrl: './transfer-target-input.component.html',
    styleUrls: ['./transfer-target-input.component.scss'],
})
export class TransferTargetInputComponent {
    @Input() elementType!: 'personnel' | 'vehicle';
    @Input() elementId!: UUID;
    @Input() transfer!: Transfer;

    public readonly transferPoints$ =
        this.storeService.select$(selectTransferPoints);

    constructor(
        private readonly storeService: StoreService,
        private readonly exerciseService: ExerciseService
    ) {}

    public setTransferTarget(targetTransferPointId: UUID) {
        this.exerciseService.proposeAction({
            type: '[Transfer] Edit transfer',
            elementType: this.elementType,
            elementId: this.elementId,
            targetTransferPointId,
        });
    }
}
