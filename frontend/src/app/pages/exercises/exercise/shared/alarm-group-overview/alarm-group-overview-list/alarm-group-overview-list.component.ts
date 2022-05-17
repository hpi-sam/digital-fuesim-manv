import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { AlarmGroupVehicle } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectAlarmGroups,
    selectVehicleTemplates,
} from 'src/app/state/exercise/exercise.selectors';
import { openEditAlarmGroupModal } from '../edit-alarm-group-modal/open-edit-alarm-group-modal';
import { openEditAlarmGroupVehicleModal } from '../edit-alarm-group-vehicle-modal/open-edit-alarm-group-vehicle-modal';

@Component({
    selector: 'app-alarm-group-overview-list',
    templateUrl: './alarm-group-overview-list.component.html',
    styleUrls: ['./alarm-group-overview-list.component.scss'],
})
export class AlarmGroupOverviewListComponent {
    public readonly alarmGroups$ = this.store.select(selectAlarmGroups);

    public readonly vehicleTemplates$ = this.store.select(
        selectVehicleTemplates
    );

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        private readonly ngbModalService: NgbModal
    ) {}

    editAlarmGroup(alarmGroupId: UUID) {
        openEditAlarmGroupModal(this.ngbModalService, alarmGroupId);
    }

    editAlarmGroupVehicle(alarmGroupId: UUID, alarmGroupVehicleId: UUID) {
        openEditAlarmGroupVehicleModal(
            this.ngbModalService,
            alarmGroupId,
            alarmGroupVehicleId
        );
    }

    createAlarmGroupVehicle(alarmGroupId: UUID, vehicleTemplateId: UUID) {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Add AlarmGroupVehicle',
            alarmGroupId,
            alarmGroupVehicle: new AlarmGroupVehicle(vehicleTemplateId, 5),
        });
    }
}
