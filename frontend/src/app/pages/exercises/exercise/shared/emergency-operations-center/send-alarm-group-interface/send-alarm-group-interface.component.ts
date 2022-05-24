import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { AlarmGroup, TransferPoint } from 'digital-fuesim-manv-shared';
import {
    createVehicle,
    AlarmGroupStartPoint,
} from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectVehicleTemplate,
    selectAlarmGroups,
    selectTransferPoints,
} from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

@Component({
    selector: 'app-send-alarm-group-interface',
    templateUrl: './send-alarm-group-interface.component.html',
    styleUrls: ['./send-alarm-group-interface.component.scss'],
})
export class SendAlarmGroupInterfaceComponent {
    public readonly alarmGroups$ = this.store.select(selectAlarmGroups);

    public readonly transferPoints$ = this.store.select(selectTransferPoints);

    public targetName = 'Kein Ziel ausgewählt';
    public targetTransferPoint?: TransferPoint;

    public isCollapsed = true;

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>
    ) {}

    public setTargetTransferPoint(transferPoint: TransferPoint) {
        this.targetTransferPoint = transferPoint;
        this.targetName = transferPoint.externalName;
    }

    public sendAlarmGroup(alarmGroup: AlarmGroup) {
        // TODO: Make this into one Action (The Problem with that is the uuid generation)const alarmGroup = getElement(
        Object.values(alarmGroup.alarmGroupVehicles).forEach(
            (alarmGroupVehicle) => {
                const vehicleTemplate = getSelectVehicleTemplate(
                    alarmGroupVehicle.vehicleTemplateId
                )(getStateSnapshot(this.store));
                const vehicleParameters = createVehicle(vehicleTemplate);
                this.apiService.proposeAction({
                    type: '[Vehicle] Add vehicle',
                    materials: vehicleParameters.materials,
                    personnel: vehicleParameters.personnel,
                    vehicle: vehicleParameters.vehicle,
                });

                this.apiService.proposeAction({
                    type: '[Transfer] Add to transfer',
                    elementType: 'vehicles',
                    elementId: vehicleParameters.vehicle.id,
                    startPoint: AlarmGroupStartPoint.create(
                        alarmGroup.name,
                        alarmGroupVehicle.time
                    ),
                    targetTransferPointId: this.targetTransferPoint!.id,
                });
            }
        );
    }
}
