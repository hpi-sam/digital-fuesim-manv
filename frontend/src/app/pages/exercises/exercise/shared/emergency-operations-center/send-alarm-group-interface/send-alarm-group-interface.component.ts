import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, AlarmGroup } from 'digital-fuesim-manv-shared';
import {
    TransferPoint,
    createVehicleParameters,
    AlarmGroupStartPoint,
} from 'digital-fuesim-manv-shared';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectClient,
    getSelectTransferPoint,
    getSelectVehicleTemplate,
    selectAlarmGroups,
    selectMaterialTemplates,
    selectPersonnelTemplates,
    selectTransferPoints,
} from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

// We want to remember this
let targetTransferPointId: UUID | undefined;

@Component({
    selector: 'app-send-alarm-group-interface',
    templateUrl: './send-alarm-group-interface.component.html',
    styleUrls: ['./send-alarm-group-interface.component.scss'],
})
export class SendAlarmGroupInterfaceComponent implements OnDestroy {
    private readonly destroy$ = new Subject<void>();

    public readonly alarmGroups$ = this.store.select(selectAlarmGroups);

    public readonly transferPoints$ = this.store.select(selectTransferPoints);

    public getTransferPointOrderByValue: (
        transferPoint: TransferPoint
    ) => string = (transferPoint) => TransferPoint.getFullName(transferPoint);

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
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
        const targetTransferPoint = getSelectTransferPoint(
            this.targetTransferPointId!
        )(getStateSnapshot(this.store));
        // TODO: Refactor this into one action (uuid generation is currently not possible in the reducer)
        Promise.all(
            Object.values(alarmGroup.alarmGroupVehicles).flatMap(
                (alarmGroupVehicle) => {
                    const vehicleTemplate = getSelectVehicleTemplate(
                        alarmGroupVehicle.vehicleTemplateId
                    )(getStateSnapshot(this.store));

                    const vehicleParameters = createVehicleParameters(
                        {
                            ...vehicleTemplate,
                            name: alarmGroupVehicle.name,
                        },
                        selectMaterialTemplates(getStateSnapshot(this.store)),
                        selectPersonnelTemplates(getStateSnapshot(this.store))
                    );

                    return [
                        this.apiService.proposeAction({
                            type: '[Vehicle] Add vehicle',
                            materials: vehicleParameters.materials,
                            personnel: vehicleParameters.personnel,
                            vehicle: vehicleParameters.vehicle,
                        }),
                        this.apiService.proposeAction({
                            type: '[Transfer] Add to transfer',
                            elementType: 'vehicles',
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
            this.apiService.proposeAction({
                type: '[Emergency Operation Center] Add Log Entry',
                message: `Alarmgruppe ${alarmGroup.name} wurde alarmiert zu ${targetTransferPoint.externalName}!`,
                name: getSelectClient(this.apiService.ownClientId!)(
                    getStateSnapshot(this.store)
                ).name,
            });
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }
}
