import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { Hospital, UUID } from 'digital-fuesim-manv-shared';
import { TransferPoint } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectHospitals,
    selectTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-transfer-hospitals-tab',
    templateUrl: './transfer-hospitals-tab.component.html',
    styleUrls: ['./transfer-hospitals-tab.component.scss'],
})
export class TransferHospitalsTabComponent {
    @Input() public transferPoint!: TransferPoint;

    public hospitals$: Observable<{ [key: UUID]: Hospital }> =
        this.store.select(selectHospitals);

    public readonly hospitalsToBeAdded$: Observable<{ [key: UUID]: Hospital }> =
        this.store.select(
            createSelector(
                selectTransferPoints,
                selectHospitals,
                (transferPoints, hospitals) => {
                    const currentTransferPoint =
                        transferPoints[this.transferPoint.id]!;
                    return Object.fromEntries(
                        Object.entries(hospitals).filter(
                            ([key]) =>
                                !currentTransferPoint.reachableHospitals[key]
                        )
                    );
                }
            )
        );

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    public getHospitalOrderByValue: (hospital: Hospital) => string = (
        hospital
    ) => hospital.name;

    public connectHospital(hospitalId: UUID) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Connect hospital',
            transferPointId: this.transferPoint.id,
            hospitalId,
        });
    }

    public disconnectHospital(hospitalId: UUID) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Disconnect hospital',
            transferPointId: this.transferPoint.id,
            hospitalId,
        });
    }
}
