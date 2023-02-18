import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import type { AlarmGroup, UUID } from 'digital-fuesim-manv-shared';
import {
    AlarmGroupStartPoint,
    createVehicleParameters,
    MapCoordinates,
    TransferPoint,
} from 'digital-fuesim-manv-shared';
import { Subject, takeUntil } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { StoreService } from 'src/app/core/store.service';
import {
    createSelectTransferPoint,
    createSelectVehicleTemplate,
    selectAlarmGroups,
    selectMaterialTemplates,
    selectPersonnelTemplates,
    selectTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectOwnClient } from 'src/app/state/application/selectors/shared.selectors';

// We want to remember this
let targetTransferPointId: UUID | undefined;

@Component({
    selector: 'app-send-alarm-group-interface',
    templateUrl: './send-alarm-group-interface.component.html',
    styleUrls: ['./send-alarm-group-interface.component.scss'],
})
export class SendAlarmGroupInterfaceComponent implements OnDestroy {
    private readonly destroy$ = new Subject<void>();

    public readonly alarmGroups$ = this.storeService.select$(selectAlarmGroups);

    public readonly transferPoints$ =
        this.storeService.select$(selectTransferPoints);

    public getTransferPointOrderByValue: (
        transferPoint: TransferPoint
    ) => string = (transferPoint) => TransferPoint.getFullName(transferPoint);

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly storeService: StoreService,
        private readonly messageService: MessageService
    ) {
        // reset chosen targetTransferPoint if it gets deleted
        this.transferPoints$
            .pipe(takeUntil(this.destroy$))
            .subscribe((transferPoints) => {
                if (
                    targetTransferPointId &&
                    !transferPoints[targetTransferPointId]
                ) {
                    this.targetTransferPointId = undefined;
                }
            });
    }

    public get targetTransferPointId() {
        return targetTransferPointId;
    }
    public set targetTransferPointId(value: UUID | undefined) {
        targetTransferPointId = value;
    }

    public sendAlarmGroup(alarmGroup: AlarmGroup) {
        const targetTransferPoint = this.storeService.select(
            createSelectTransferPoint(this.targetTransferPointId!)
        );
        // TODO: Refactor this into one action (uuid generation is currently not possible in the reducer)
        Promise.all(
            Object.values(alarmGroup.alarmGroupVehicles).flatMap(
                (alarmGroupVehicle) => {
                    const vehicleTemplate = this.storeService.select(
                        createSelectVehicleTemplate(
                            alarmGroupVehicle.vehicleTemplateId
                        )
                    );

                    const vehicleParameters = createVehicleParameters(
                        {
                            ...vehicleTemplate,
                            name: alarmGroupVehicle.name,
                        },
                        this.storeService.select(selectMaterialTemplates),
                        this.storeService.select(selectPersonnelTemplates),
                        // TODO: This position is not correct but needs to be provided.
                        // Here one should use a Position with the Transfer.
                        // But this is part of later Refactoring.
                        // We need the Transfer to be created before the Vehicle is created,
                        // else we need to provide a Position that is immediately overwritten by the Add to Transfer Action.
                        // This is done here
                        // Good Thing is, it is irrelevant, because the correctPosition is set immediately after this is called.
                        MapCoordinates.create(0, 0)
                    );

                    return [
                        this.exerciseService.proposeAction({
                            type: '[Vehicle] Add vehicle',
                            materials: vehicleParameters.materials,
                            personnel: vehicleParameters.personnel,
                            vehicle: vehicleParameters.vehicle,
                        }),
                        this.exerciseService.proposeAction({
                            type: '[Transfer] Add to transfer',
                            elementType: vehicleParameters.vehicle.type,
                            elementId: vehicleParameters.vehicle.id,
                            startPoint: AlarmGroupStartPoint.create(
                                alarmGroup.name,
                                alarmGroupVehicle.time
                            ),
                            targetTransferPointId: targetTransferPoint.id,
                        }),
                    ];
                }
            )
        ).then((requests) => {
            if (requests.every((request) => request.success)) {
                this.messageService.postMessage({
                    title: `Alarmgruppe ${alarmGroup.name} alarmiert!`,
                    color: 'success',
                });
            }
            this.exerciseService.proposeAction({
                type: '[Emergency Operation Center] Add Log Entry',
                message: `Alarmgruppe ${alarmGroup.name} wurde alarmiert zu ${targetTransferPoint.externalName}!`,
                name: this.storeService.select(selectOwnClient)!.name,
            });
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }
}
