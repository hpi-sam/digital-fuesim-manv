import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { TransferPoint } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectTransferPoints } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-other-transfer-point-tab',
    templateUrl: './other-transfer-point-tab.component.html',
    styleUrls: ['./other-transfer-point-tab.component.scss'],
})
export class OtherTransferPointTabComponent {
    @Input() public transferPoint!: TransferPoint;

    public transferPoints$: Observable<{ [key: UUID]: TransferPoint }> =
        this.store.select(selectTransferPoints);

    /**
     * All transferPoints that are neither connected to this one nor this one itself
     */
    public readonly transferPointsToBeAdded$ = this.store.select(
        createSelector(selectTransferPoints, (transferPoints) => {
            const currentTransferPoint = transferPoints[this.transferPoint.id]!;
            return Object.fromEntries(
                Object.entries(transferPoints).filter(
                    ([key]) =>
                        key !== this.transferPoint.id &&
                        !currentTransferPoint.reachableTransferPoints[key]
                )
            );
        })
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    public connectTransferPoint(transferPointId: UUID, duration?: number) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Connect TransferPoints',
            transferPointId1: this.transferPoint.id,
            transferPointId2: transferPointId,
            duration,
        });
    }

    public disconnectTransferPoint(transferPointId: UUID) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Disconnect TransferPoints',
            transferPointId1: this.transferPoint.id,
            transferPointId2: transferPointId,
        });
    }

    public getTransferPointOrderByValue: (
        transferPoint: TransferPoint
    ) => string = (transferPoint) => TransferPoint.getFullName(transferPoint);
}
