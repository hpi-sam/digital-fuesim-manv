import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { createSelector } from '@ngrx/store';
import type { Hospital, UUID } from 'digital-fuesim-manv-shared';
import { TransferPoint } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import {
    createSelectTransferPoint,
    selectHospitals,
    selectTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';
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
})
export class TransferPointPopupComponent implements PopupComponent, OnInit {
    // These properties are only set after OnInit
    public transferPointId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public transferPoint$?: Observable<TransferPoint>;

    public readonly currentRole$ = this.storeService.select$(selectCurrentRole);
    public hospital$?: Observable<Hospital>;

    public get activeNavId() {
        return activeNavId;
    }
    public set activeNavId(value: NavIds) {
        activeNavId = value;
    }

    public transferPoints$ = this.storeService.select$(selectTransferPoints);

    public hospitals$ = this.storeService.select$(selectHospitals);

    public getTransferPointOrderByValue: (
        transferPoint: TransferPoint
    ) => string = (transferPoint) => TransferPoint.getFullName(transferPoint);

    public getHospitalOrderByValue: (hospital: Hospital) => string = (
        hospital
    ) => hospital.name;

    /**
     * All transferPoints that are neither connected to this one nor this one itself
     */
    public readonly transferPointsToBeAdded$ = this.storeService.select$(
        createSelector(selectTransferPoints, (transferPoints) => {
            const currentTransferPoint = transferPoints[this.transferPointId]!;
            return Object.fromEntries(
                Object.entries(transferPoints).filter(
                    ([key]) =>
                        key !== this.transferPointId &&
                        !currentTransferPoint.reachableTransferPoints[key]
                )
            );
        })
    );

    public readonly hospitalsToBeAdded$ = this.storeService.select$(
        createSelector(
            selectTransferPoints,
            selectHospitals,
            (transferPoints, hospitals) => {
                const currentTransferPoint =
                    transferPoints[this.transferPointId]!;
                return Object.fromEntries(
                    Object.entries(hospitals).filter(
                        ([key]) => !currentTransferPoint.reachableHospitals[key]
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

    public connectTransferPoint(transferPointId: UUID, duration?: number) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Connect TransferPoints',
            transferPointId1: this.transferPointId,
            transferPointId2: transferPointId,
            duration,
        });
    }

    public disconnectTransferPoint(transferPointId: UUID) {
        this.exerciseService.proposeAction({
            type: '[TransferPoint] Disconnect TransferPoints',
            transferPointId1: this.transferPointId,
            transferPointId2: transferPointId,
        });
    }

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
