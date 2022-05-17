import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlarmGroup } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';

@Component({
    selector: 'app-alarm-group-overview-modal',
    templateUrl: './alarm-group-overview-modal.component.html',
    styleUrls: ['./alarm-group-overview-modal.component.scss'],
})
export class AlarmGroupOverviewModalComponent {
    public exerciseId!: string;

    constructor(
        public activeModal: NgbActiveModal,
        private readonly apiService: ApiService
    ) {}

    public close() {
        this.activeModal.close();
    }

    public addAlarmGroup() {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Add AlarmGroup',
            alarmGroup: new AlarmGroup('MANV 10'),
        });
    }
}
