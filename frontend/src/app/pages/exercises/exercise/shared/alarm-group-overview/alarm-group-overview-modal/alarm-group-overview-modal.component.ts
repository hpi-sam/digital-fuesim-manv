import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlarmGroup } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import {
    selectAlarmGroups,
    selectVehicleTemplates,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-alarm-group-overview-modal',
    templateUrl: './alarm-group-overview-modal.component.html',
    styleUrls: ['./alarm-group-overview-modal.component.scss'],
})
export class AlarmGroupOverviewModalComponent {
    public exerciseId!: string;

    constructor(
        public activeModal: NgbActiveModal,
        private readonly exerciseService: ExerciseService,
        private readonly storeService: StoreService
    ) {}

    public readonly alarmGroups$ = this.storeService.select$(selectAlarmGroups);

    public readonly vehicleTemplates$ = this.storeService.select$(
        selectVehicleTemplates
    );

    public close() {
        this.activeModal.close();
    }

    public addAlarmGroup() {
        this.exerciseService.proposeAction({
            type: '[AlarmGroup] Add AlarmGroup',
            alarmGroup: AlarmGroup.create('???'),
        });
    }
}
