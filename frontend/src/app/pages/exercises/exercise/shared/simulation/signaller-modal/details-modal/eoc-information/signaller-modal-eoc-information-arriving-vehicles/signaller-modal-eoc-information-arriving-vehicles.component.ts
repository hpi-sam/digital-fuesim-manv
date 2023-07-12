import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { currentTransferOf } from 'digital-fuesim-manv-shared';
import { groupBy } from 'lodash-es';
import type { AppState } from 'src/app/state/app.state';
import {
    selectCurrentTime,
    selectVehiclesInTransfer,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';

interface ArrivingVehicle {
    name: string;
    vehicleType: string;
    remainingMinutes: number;
}

@Component({
    selector: 'app-signaller-modal-eoc-information-arriving-vehicles',
    templateUrl:
        './signaller-modal-eoc-information-arriving-vehicles.component.html',
    styleUrls: [
        './signaller-modal-eoc-information-arriving-vehicles.component.scss',
    ],
})
export class SignallerModalEocInformationArrivingVehiclesComponent {
    arrivingVehicles: ArrivingVehicle[];

    public get arrivingVehicleGroups() {
        return Object.entries(
            groupBy(
                this.arrivingVehicles,
                (arrivingVehicle) => arrivingVehicle.vehicleType
            )
        ).map(([type, vehicles]) => ({ type, count: vehicles.length }));
    }

    constructor(store: Store<AppState>) {
        const currentTime = selectStateSnapshot(selectCurrentTime, store);

        this.arrivingVehicles = selectStateSnapshot(
            selectVehiclesInTransfer,
            store
        )
            .map((vehicle) => ({
                vehicle,
                transfer: currentTransferOf(vehicle),
            }))
            .filter(
                (vehicleTransfer) =>
                    vehicleTransfer.transfer.startPoint.type ===
                    'alarmGroupStartPoint'
            )
            .map((vehicleTransfer) => ({
                name: vehicleTransfer.vehicle.name,
                vehicleType: vehicleTransfer.vehicle.vehicleType,
                remainingMinutes: Math.ceil(
                    (vehicleTransfer.transfer.endTimeStamp - currentTime) /
                        1000 /
                        60
                ),
            }))
            .sort((a, b) => a.remainingMinutes - b.remainingMinutes);
    }
}
