import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { AlarmGroup, UUID } from 'digital-fuesim-manv-shared';
import {
    AlarmGroupStartPoint,
    createVehicleParameters,
} from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectVehicleTemplate,
    selectAlarmGroups,
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
export class SendAlarmGroupInterfaceComponent {
    public readonly alarmGroups$ = this.store.select(selectAlarmGroups);

    public readonly transferPoints$ = this.store.select(selectTransferPoints);

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService
    ) {}

    public get targetTransferPointId() {
        return targetTransferPointId;
    }
    public set targetTransferPointId(value: UUID | undefined) {
        targetTransferPointId = value;
    }

    public sendAlarmGroup(alarmGroup: AlarmGroup) {
        // TODO: Refactor this into one action (uuid generation is currently not possible in the reducer)
        Promise.all(
            Object.values(alarmGroup.alarmGroupVehicles).flatMap(
                (alarmGroupVehicle) => {
                    const vehicleTemplate = getSelectVehicleTemplate(
                        alarmGroupVehicle.vehicleTemplateId
                    )(getStateSnapshot(this.store));

                    const vehicleParameters =
                        createVehicleParameters(vehicleTemplate);

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
                            targetTransferPointId: targetTransferPointId!,
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
        });
    }
}
