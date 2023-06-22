import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ExerciseRadiogram,
    ExerciseSimulationBehaviorState,
    ExerciseSimulationBehaviorType,
    ReportableInformation,
} from 'digital-fuesim-manv-shared';
import {
    StrictObject,
    UUID,
    getKeyDetails,
    isAccepted,
    isInterfaceSignallerKeyForClient,
    isUnread,
    makeInterfaceSignallerKey,
} from 'digital-fuesim-manv-shared';
import { groupBy } from 'lodash-es';
import {
    map,
    takeUntil,
    type Observable,
    Subject,
    BehaviorSubject,
} from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';
import type { AppState } from 'src/app/state/app.state';
import { selectOwnClientId } from 'src/app/state/application/selectors/application.selectors';
import {
    createSelectBehaviorStates,
    selectRadiograms,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';

interface InformationType {
    key: string;
    title: string;
    details?: string;
    hotkey: Hotkey;
    callback: () => void;
    requiredBehaviors: ExerciseSimulationBehaviorType[];
    errorMessage?: string;
    loading$: BehaviorSubject<boolean>;
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
    private clientId!: UUID;

    informationTypes: InformationType[] = [
        {
            key: 'patientCount',
            title: 'Anzahl Patienten',
            details: 'nach Sichtungskategorie',
            hotkey: new Hotkey('1', false, () => this.requestPatientCount()),
            callback: () => this.requestPatientCount(),
            requiredBehaviors: ['treatPatientsBehavior'],
            errorMessage: 'Dieser Bereich behandelt keine Patienten',
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'transportProgressFull',
            title: 'Transportfortschritt',
            details: 'für alle Bereiche',
            hotkey: new Hotkey('2', false, () =>
                this.requestFullTransportProgress()
            ),
            callback: () => this.requestFullTransportProgress(),
            requiredBehaviors: ['managePatientTransportToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'transportProgressRegion',
            title: 'Transportfortschritt',
            details: 'für diesen Bereich',
            hotkey: new Hotkey('3', false, () =>
                this.requestRegionTransportProgress()
            ),
            callback: () => this.requestRegionTransportProgress(),
            requiredBehaviors: ['transferToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'vehicleCount',
            title: 'Anzahl Fahrzeuge',
            details: 'nach Typ',
            hotkey: new Hotkey('4', false, () => this.requestVehicleCount()),
            callback: () => this.requestVehicleCount(),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'requiredVehicles',
            title: 'Benötigte Fahrzeuge',
            details:
                'um alle Patienten zu behandeln (PA) oder Anfragen zu erfüllen (B-Raum)',
            // TODO: Hotkey, callback, ...
            hotkey: new Hotkey('5', false, () => this.requestPatientCount()),
            callback: () => this.requestPatientCount(),
            requiredBehaviors: ['requestBehavior'],
            errorMessage:
                'Dieser Bereich benötigt keine Fahrzeuge für seine Arbeit',
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Arriving vehicles (number, ETA)
        {
            key: 'treatmentStatus',
            title: 'Behandlungsstatus',
            details: 'Erstversorgung sichergestellt?',
            hotkey: new Hotkey('6', false, () => this.requestTreatmentStatus()),
            callback: () => this.requestTreatmentStatus(),
            requiredBehaviors: ['treatPatientsBehavior'],
            errorMessage: 'Dieser Bereich behandelt keine Patienten',
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Location
        // TODO: Vehicle occupation
        {
            key: 'transferConnections',
            title: 'Transferverbindungen',
            details: 'zu anderen Bereichen',
            hotkey: new Hotkey('7', false, () =>
                this.requestTransferConnections()
            ),
            callback: () => this.requestTransferConnections(),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Patient treatments
        {
            key: 'personnelCount',
            title: 'Anzahl Personal',
            details: 'nach Typ',
            hotkey: new Hotkey('8', false, () => this.requestPersonnelCount()),
            callback: () => this.requestPersonnelCount(),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Patient details
    ];
    behaviors$!: Observable<readonly ExerciseSimulationBehaviorState[]>;
    hasReportBehavior$!: Observable<boolean>;
    requestable$!: Observable<{ [key: string]: boolean }>;
    informationRadiograms$!: Observable<{ [key: string]: ExerciseRadiogram[] }>;
    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly hotkeysService: HotkeysService
    ) {}

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysService.createLayer();
        this.clientId = selectStateSnapshot(selectOwnClientId, this.store)!;

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

        const radiograms$ = this.store
            .select(selectRadiograms)
            .pipe(map((radiograms) => StrictObject.values(radiograms)));

        // Automatically accept all radiograms that contain reports for requested information
        radiograms$
            .pipe(
                map((radiograms) =>
                    radiograms.filter((radiogram) => isUnread(radiogram))
                ),
                map((radiograms) =>
                    radiograms.filter((radiogram) =>
                        isInterfaceSignallerKeyForClient(
                            radiogram.key,
                            this.clientId
                        )
                    )
                ),
                takeUntil(this.destroy$)
            )
            .subscribe((radiograms) => {
                radiograms.forEach((radiogram) => {
                    this.exerciseService.proposeAction({
                        type: '[Radiogram] Accept radiogram',
                        clientId: this.clientId,
                        radiogramId: radiogram.id,
                    });

                    this.setLoadingState(getKeyDetails(radiogram.key!), false);
                });
            });

        this.informationRadiograms$ = radiograms$.pipe(
            map((radiograms) =>
                radiograms.filter((radiogram) => isAccepted(radiogram))
            ),
            map((radiograms) =>
                radiograms.filter((radiogram) =>
                    isInterfaceSignallerKeyForClient(
                        radiogram.key,
                        this.clientId
                    )
                )
            ),
            map((radiograms) =>
                groupBy(radiograms, (radiogram) =>
                    getKeyDetails(radiogram.key!)
                )
            )
        );
    }

    ngOnDestroy() {
        this.hotkeysService.removeLayer(this.hotkeyLayer);
        this.destroy$.next();
    }

    public requestPatientCount() {
        const key = 'patientCount';
        if (this.requestBlocked(key)) return;

        this.setLoadingState(key, true);
        this.requestSimpleReport('patientCount', key);
    }

    public requestFullTransportProgress() {
        const key = 'transportProgressFull';
        if (this.requestBlocked(key)) return;

        this.setLoadingState(key, true);
        this.requestSimpleReport('transportManagementTransferCounts', key);
    }

    public requestRegionTransportProgress() {
        const key = 'transportProgressRegion';
        if (this.requestBlocked(key)) return;

        this.setLoadingState(key, true);
        this.requestSimpleReport('singleRegionTransferCounts', key);
    }

    public requestVehicleCount() {
        const key = 'vehicleCount';
        if (this.requestBlocked(key)) return;

        this.setLoadingState(key, true);
        this.requestSimpleReport('vehicleCount', key);
    }

    public requestTreatmentStatus() {
        const key = 'treatmentStatus';
        if (this.requestBlocked(key)) return;

        this.setLoadingState(key, true);
        this.requestSimpleReport('treatmentStatus', key);
    }

    public requestTransferConnections() {
        const key = 'transferConnections';
        if (this.requestBlocked(key)) return;

        this.setLoadingState(key, true);
        this.requestSimpleReport('transferConnections', key);
    }

    public requestPersonnelCount() {
        const key = 'personnelCount';
        if (this.requestBlocked(key)) return;

        this.setLoadingState(key, true);
        this.requestSimpleReport('personnelCount', key);
    }

    /**
     * Requests an information trough the report behavior
     * @param informationType The information to be requested
     */
    requestSimpleReport(informationType: ReportableInformation, key: string) {
        this.exerciseService.proposeAction({
            type: '[ReportBehavior] Create Report',
            simulatedRegionId: this.simulatedRegionId,
            informationType,
            interfaceSignallerKey: makeInterfaceSignallerKey(
                this.clientId,
                key
            ),
        });
    }

    requestBlocked(key: string) {
        return (
            this.informationTypes
                .find((information) => information.key === key)
                ?.loading$.getValue() ?? false
        );
    }

    setLoadingState(key: string, loadingState: boolean) {
        this.informationTypes
            .find((information) => information.key === key)
            ?.loading$.next(loadingState);
    }
}
