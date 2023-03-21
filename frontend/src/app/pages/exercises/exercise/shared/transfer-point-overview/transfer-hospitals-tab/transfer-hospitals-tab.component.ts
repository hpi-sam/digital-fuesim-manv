import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector } from '@ngrx/store';
import type { Hospital, TransferPoint } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import {
    createSelectTransferPoint,
    selectHospitals,
    selectTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-transfer-hospitals-tab',
    templateUrl: './transfer-hospitals-tab.component.html',
    styleUrls: ['./transfer-hospitals-tab.component.scss'],
})
export class TransferHospitalsTabComponent implements OnInit {
    @Input() public transferPointId!: UUID;

    public transferPoint$!: Observable<TransferPoint>;

    public hospitals$: Observable<{ [key: UUID]: Hospital }> =
        this.storeService.select$(selectHospitals);

    public readonly hospitalsToBeAdded$: Observable<{ [key: UUID]: Hospital }> =
        this.storeService.select$(
            createSelector(
                selectTransferPoints,
                selectHospitals,
                (transferPoints, hospitals) => {
                    const currentTransferPoint =
                        transferPoints[this.transferPointId]!;
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
        private readonly storeService: StoreService
    ) {}

    ngOnInit() {
        this.transferPoint$ = this.storeService.select$(
            createSelectTransferPoint(this.transferPointId)
        );
    }

    public getHospitalOrderByValue: (hospital: Hospital) => string = (
        hospital
    ) => hospital.name;

    public connectHospital(hospitalId: UUID) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Connect hospital',
            transferPointId: this.transferPointId,
            hospitalId,
        });
    }

    public disconnectHospital(hospitalId: UUID) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Disconnect hospital',
            transferPointId: this.transferPointId,
            hospitalId,
        });
    }
}
