import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { AlarmGroup, AlarmGroupVehicle } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectVehicleTemplates } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-alarm-group-item',
    templateUrl: './alarm-group-item.component.html',
    styleUrls: ['./alarm-group-item.component.scss'],
})
export class AlarmGroupItemComponent {
    @Input() alarmGroup!: AlarmGroup;

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>
    ) {}

    public readonly vehicleTemplates$ = this.store.select(
        selectVehicleTemplates
    );

    public renameAlarmGroup(name: string | null) {
        if (name === null) {
            return;
        }
        this.apiService.proposeAction(
            {
                type: '[AlarmGroup] Rename AlarmGroup',
                alarmGroupId: this.alarmGroup.id,
                name,
            },
            true
        );
    }

    public removeAlarmGroup() {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Remove AlarmGroup',
            alarmGroupId: this.alarmGroup.id,
        });
    }

    public removeVehicleTemplate(alarmGroupVehicleId: UUID) {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Remove AlarmGroupVehicle',
            alarmGroupId: this.alarmGroup.id,
            alarmGroupVehicleId,
        });
    }

    public editAlarmGroupVehicle(
        alarmGroupVehicleId: UUID,
        time: number | null
    ) {
        if (time === null) {
            return;
        }
        this.apiService.proposeAction(
            {
                type: '[AlarmGroup] Edit AlarmGroupVehicle',
                alarmGroupId: this.alarmGroup.id,
                alarmGroupVehicleId,
                time,
            },
            true
        );
    }

    public createAlarmGroupVehicle(vehicleTemplateId: UUID) {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Add AlarmGroupVehicle',
            alarmGroupId: this.alarmGroup.id,
            alarmGroupVehicle: AlarmGroupVehicle.create(vehicleTemplateId, 5),
        });
    }
}
