import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { AlarmGroup, AlarmGroupVehicle } from 'digital-fuesim-manv-shared';
import { debounce } from 'lodash';
import { ApiService } from 'src/app/core/api.service';
import { debounceTimeout } from 'src/app/shared/variables/debounce-timeout';
import type { AppState } from 'src/app/state/app.state';
import { selectVehicleTemplates } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

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

    public readonly renameAlarmGroup = debounce((name: string | null) => {
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
    }, debounceTimeout);

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

    public readonly editAlarmGroupVehicle = debounce(
        (
            alarmGroupVehicleId: UUID,
            time: number | null,
            name: string | null
        ) => {
            if (time === null) {
                return;
            }
            if (name === null) {
                return;
            }
            this.apiService.proposeAction(
                {
                    type: '[AlarmGroup] Edit AlarmGroupVehicle',
                    alarmGroupId: this.alarmGroup.id,
                    alarmGroupVehicleId,
                    time,
                    name,
                },
                true
            );
        },
        debounceTimeout
    );

    public createAlarmGroupVehicle(vehicleTemplateId: UUID) {
        const vehicleTemplate = getStateSnapshot(
            this.store
        ).exercise.vehicleTemplates.find(
            (_vehicleTemplate) => _vehicleTemplate.id === vehicleTemplateId
        )!;
        this.apiService.proposeAction({
            type: '[AlarmGroup] Add AlarmGroupVehicle',
            alarmGroupId: this.alarmGroup.id,
            alarmGroupVehicle: AlarmGroupVehicle.create(
                vehicleTemplateId,
                5 * 60 * 1000,
                vehicleTemplate.name
            ),
        });
    }
}
