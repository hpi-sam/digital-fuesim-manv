import type { OnDestroy, OnInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { TransferPoint } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { Subject, map, takeUntil } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { SearchableDropdownOption } from 'src/app/shared/components/searchable-dropdown/searchable-dropdown.component';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectAlarmGroup,
    selectAlarmGroups,
    selectTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectOwnClient } from 'src/app/state/application/selectors/shared.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NgModel } from '@angular/forms';
import type { HotkeyLayer } from '../../services/hotkeys.service';
import { Hotkey, HotkeysService } from '../../services/hotkeys.service';

// We want to remember this
let selectedAlarmGroup: SearchableDropdownOption | null = null;
let selectedTarget: SearchableDropdownOption | null = null;
let selectedFirstVehiclesTarget: SearchableDropdownOption | null = null;
let firstVehiclesCount = 0;

@Component({
    selector: 'app-send-alarm-group-interface',
    templateUrl: './send-alarm-group-interface.component.html',
    styleUrls: ['./send-alarm-group-interface.component.scss'],
})
export class SendAlarmGroupInterfaceComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    @ViewChild('selectAlarmGroupPopover')
    selectAlarmGroupPopover!: NgbPopover;
    @ViewChild('selectTargetPopover')
    selectTargetPopover!: NgbPopover;
    @ViewChild('selectFirstVehiclesTargetPopover')
    selectFirstVehiclesTargetPopover!: NgbPopover;
    @ViewChild('firstVehiclesInput')
    firstVehiclesInput?: NgModel;

    private hotkeyLayer!: HotkeyLayer;
    public selectAlarmGroupHotkey = new Hotkey('A', false, () => {
        this.selectAlarmGroupPopover.open();
    });
    public selectTargetHotkey = new Hotkey('Z', false, () => {
        this.selectTargetPopover.open();
    });
    public selectFirstVehiclesTargetHotkey = new Hotkey('⇧ + Z', false, () => {
        this.selectFirstVehiclesTargetPopover.open();
    });
    public submitHotkey = new Hotkey('Enter', false, () => {
        this.sendAlarmGroup();
    });

    public loading = false;

    public readonly alarmGroups$: Observable<SearchableDropdownOption[]> =
        this.store.select(selectAlarmGroups).pipe(
            map((alarmGroups) =>
                Object.values(alarmGroups)
                    .map((alarmGroup) => {
                        const dropdownOption: SearchableDropdownOption & {
                            sent: boolean;
                        } = {
                            key: alarmGroup.id,
                            name: alarmGroup.name,
                            sent: alarmGroup.sent,
                        };

                        if (alarmGroup.sent) {
                            dropdownOption.name += ' (bereits alarmiert)';
                            dropdownOption.color = '#bbbbbb';
                        }

                        return dropdownOption;
                    })
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .sort((a, b) => Number(a.sent) - Number(b.sent))
                    .map((alarmGroup) => {
                        delete (
                            alarmGroup as SearchableDropdownOption & {
                                sent?: boolean;
                            }
                        ).sent;
                        return alarmGroup;
                    })
            )
        );

    public readonly transferPoints$: Observable<SearchableDropdownOption[]> =
        this.store.select(selectTransferPoints).pipe(
            map((transferPoints) =>
                Object.values(transferPoints)
                    .map((transferPoint) => ({
                        key: transferPoint.id,
                        name: TransferPoint.getFullName(transferPoint),
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name))
            )
        );

    public get selectedAlarmGroup() {
        return selectedAlarmGroup;
    }
    public set selectedAlarmGroup(value: SearchableDropdownOption | null) {
        selectedAlarmGroup = value;
    }

    public get selectedTarget() {
        return selectedTarget;
    }
    public set selectedTarget(value: SearchableDropdownOption | null) {
        selectedTarget = value;
    }

    public get selectedFirstVehiclesTarget() {
        return selectedFirstVehiclesTarget;
    }
    public set selectedFirstVehiclesTarget(
        value: SearchableDropdownOption | null
    ) {
        selectedFirstVehiclesTarget = value;
    }

    public get firstVehiclesCount() {
        return firstVehiclesCount;
    }
    public set firstVehiclesCount(value: number) {
        firstVehiclesCount = value;
    }

    public get canSubmit() {
        return (
            !(this.firstVehiclesInput?.invalid ?? true) &&
            selectedAlarmGroup !== null &&
            selectedTarget !== null &&
            (firstVehiclesCount === 0 || selectedFirstVehiclesTarget !== null)
        );
    }

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService,
        private readonly hotkeysService: HotkeysService
    ) {
        // reset chosen targetTransferPoint if it gets deleted
        this.transferPoints$
            .pipe(takeUntil(this.destroy$))
            .subscribe((transferPoints) => {
                if (
                    this.selectedTarget?.key &&
                    !transferPoints.some(
                        (transferPoint) =>
                            transferPoint.key === this.selectedTarget?.key
                    )
                ) {
                    this.selectedTarget = null;
                }
            });
    }

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysService.createLayer();
        this.hotkeyLayer.addHotkey(this.selectAlarmGroupHotkey);
        this.hotkeyLayer.addHotkey(this.selectTargetHotkey);
        this.hotkeyLayer.addHotkey(this.selectFirstVehiclesTargetHotkey);
        this.hotkeyLayer.addHotkey(this.submitHotkey);
    }

    ngOnDestroy() {
        this.hotkeysService.removeLayer(this.hotkeyLayer);
        this.destroy$.next();
    }

    public async sendAlarmGroup() {
        this.loading = true;

        if (!this.canSubmit) {
            this.messageService.postError({
                title: 'Fehler beim Senden der Alarmgruppe',
                body: 'Bitte geben Sie alle notwendigen Informationen an!',
            });
            this.loading = false;
            return;
        }

        const alarmGroup = selectStateSnapshot(
            createSelectAlarmGroup(selectedAlarmGroup!.key),
            this.store
        );

        const firstVehiclesCountForAction = this.firstVehiclesCount;
        const firstVehiclesCountReducedBy = Math.min(
            Object.keys(alarmGroup.alarmGroupVehicles).length,
            this.firstVehiclesCount
        );
        this.firstVehiclesCount -= firstVehiclesCountReducedBy;
        const request = await this.exerciseService.proposeAction({
            type: '[Emergency Operation Center] Send Alarm Group',
            clientName: selectStateSnapshot(selectOwnClient, this.store)!.name,
            alarmGroupId: alarmGroup.id,
            targetTransferPointId: this.selectedTarget!.key,
            firstVehiclesCount: firstVehiclesCountForAction,
            firstVehiclesTargetTransferPointId:
                this.selectedFirstVehiclesTarget?.key,
        });
        this.loading = false;
        if (request.success) {
            this.messageService.postMessage({
                title: `Alarmgruppe ${alarmGroup.name} alarmiert!`,
                color: 'success',
            });
        } else {
            this.firstVehiclesCount += firstVehiclesCountReducedBy;
            this.messageService.postError({
                title: 'Fehler beim Senden der Alarmgruppe',
                body: 'Die Alarmgruppe konnte nicht gesendet werden',
            });
        }
    }
}
