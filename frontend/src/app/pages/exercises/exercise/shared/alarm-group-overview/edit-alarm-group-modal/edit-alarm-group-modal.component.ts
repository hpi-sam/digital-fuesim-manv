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
    selector: 'app-edit-alarm-group-modal',
    templateUrl: './edit-alarm-group-modal.component.html',
    styleUrls: ['./edit-alarm-group-modal.component.scss'],
})
export class EditAlarmGroupModalComponent implements OnInit {
    public alarmGroupId!: UUID;

    public name?: string;

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal
    ) {}

    ngOnInit(): void {
        const alarmGroup = getSelectAlarmGroup(this.alarmGroupId)(
            getStateSnapshot(this.store)
        );
        this.name = alarmGroup.name;
    }

    renameAlarmGroup(name: string) {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Rename AlarmGroup',
            alarmGroupId: this.alarmGroupId,
            name,
        });
        this.close();
    }

    deleteAlarmGroup() {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Remove AlarmGroup',
            alarmGroupId: this.alarmGroupId,
        });
        this.close();
    }

    public close() {
        this.activeModal.close();
    }
}
