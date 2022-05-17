import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { getSelectAlarmGroup } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

@Component({
    selector: 'app-edit-alarm-group-vehicle-modal',
    templateUrl: './edit-alarm-group-vehicle-modal.component.html',
    styleUrls: ['./edit-alarm-group-vehicle-modal.component.scss'],
})
export class EditAlarmGroupVehicleModalComponent implements OnInit {
    public alarmGroupId!: UUID;
    public alarmGroupVehicleId!: UUID;
    public time?: number;

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal
    ) {}

    ngOnInit(): void {
        const alarmGroup = getSelectAlarmGroup(this.alarmGroupId)(
            getStateSnapshot(this.store)
        );
        const alarmGroupVehicle =
            alarmGroup.alarmGroupVehicles[this.alarmGroupVehicleId];
        console.log(alarmGroupVehicle);
        this.time = alarmGroupVehicle.time;
    }

    editAlarmGroupVehicle(time: number) {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Edit AlarmGroupVehicle',
            alarmGroupId: this.alarmGroupId,
            alarmGroupVehicleId: this.alarmGroupVehicleId,
            time,
        });
        this.close();
    }

    deleteAlarmGroupVehicle() {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Remove AlarmGroupVehicle',
            alarmGroupId: this.alarmGroupId,
            alarmGroupVehicleId: this.alarmGroupVehicleId,
        });
        this.close();
    }

    public close() {
        this.activeModal.close();
    }
}
