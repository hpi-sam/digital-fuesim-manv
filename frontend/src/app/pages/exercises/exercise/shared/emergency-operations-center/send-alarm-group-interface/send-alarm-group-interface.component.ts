import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { TransferPoint, UUID } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectAlarmGroups,
    selectTransferPoints,
} from 'src/app/state/exercise/exercise.selectors';

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

    public sendAlarmGroup(alarmGroupId: UUID) {
        this.apiService.proposeAction({
            type: '[AlarmGroup] Send AlarmGroup',
            alarmGroupId,
            targetTransferPointId: this.targetTransferPoint!.id,
        });
    }
}
