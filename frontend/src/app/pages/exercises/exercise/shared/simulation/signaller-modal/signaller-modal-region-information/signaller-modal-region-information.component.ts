import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ExerciseSimulationBehaviorState,
    ExerciseSimulationBehaviorType,
} from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import { map, type Observable } from 'rxjs';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';
import type { AppState } from 'src/app/state/app.state';
import { createSelectBehaviorStates } from 'src/app/state/application/selectors/exercise.selectors';

interface InformationType {
    key: string;
    title: string;
    details?: string;
    hotkey: Hotkey;
    callback: () => void;
    requiredBehaviors: ExerciseSimulationBehaviorType[];
    errorMessage?: string;
}

@Component({
    selector: 'app-signaller-modal-region-information',
    templateUrl: './signaller-modal-region-information.component.html',
    styleUrls: ['./signaller-modal-region-information.component.scss'],
})
export class SignallerModalRegionInformationComponent
    implements OnInit, OnChanges, OnDestroy
{
    @Input()
    simulatedRegionId!: UUID;

    private hotkeyLayer!: HotkeyLayer;

    informationTypes: InformationType[] = [
        {
            key: 'patientCount',
            title: 'Anzahl Patienten',
            details: 'nach Sichtungskategorie',
            hotkey: new Hotkey('1', false, () => this.requestPatientCount()),
            callback: () => this.requestPatientCount(),
            requiredBehaviors: ['treatPatientsBehavior'],
            errorMessage: 'Dieser Bereich behandelt keine Patienten',
        },
        {
            key: 'transportProgressFull',
            title: 'Transportfortschritt',
            details: 'für alle Bereiche',
            hotkey: new Hotkey('2', false, () => this.requestPatientCount()),
            callback: () => this.requestPatientCount(),
            requiredBehaviors: ['managePatientTransportToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
        },
        {
            key: 'transportProgressRegion',
            title: 'Transportfortschritt',
            details: 'für diesen Bereich',
            hotkey: new Hotkey('3', false, () => this.requestPatientCount()),
            callback: () => this.requestPatientCount(),
            requiredBehaviors: ['transferToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
        },
    ];
    behaviors$!: Observable<readonly ExerciseSimulationBehaviorState[]>;
    hasReportBehavior$!: Observable<boolean>;
    requestable$!: Observable<{ [key: string]: boolean }>;

    constructor(
        private readonly store: Store<AppState>,
        private readonly hotkeysService: HotkeysService
    ) {}

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysService.createLayer();

        this.informationTypes.forEach((informationType) =>
            this.hotkeyLayer.addHotkey(informationType.hotkey)
        );
    }

    ngOnChanges() {
        this.behaviors$ = this.store.select(
            createSelectBehaviorStates(this.simulatedRegionId)
        );

        this.hasReportBehavior$ = this.behaviors$.pipe(
            map((behaviors) =>
                behaviors.some((behavior) => behavior.type === 'reportBehavior')
            )
        );

        this.requestable$ = this.behaviors$.pipe(
            map((behaviors) =>
                Object.fromEntries(
                    this.informationTypes.map((informationType) => [
                        informationType.key,
                        informationType.requiredBehaviors.every(
                            (requiredBehavior) =>
                                behaviors.some(
                                    (behavior) =>
                                        behavior.type === requiredBehavior
                                )
                        ),
                    ])
                )
            )
        );
    }

    ngOnDestroy() {
        this.hotkeysService.removeLayer(this.hotkeyLayer);
    }

    public requestPatientCount() {
        console.log('PATIENT COUNT');
    }

    public requestTransportProgress() {
        console.log('TRANSPORT PROGRESS');
    }
}
