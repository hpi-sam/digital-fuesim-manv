import type { OnChanges, OnInit } from '@angular/core';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import type { ReportableInformation } from 'digital-fuesim-manv-shared';
import { UUID, makeInterfaceSignallerKey } from 'digital-fuesim-manv-shared';
import { type Observable, BehaviorSubject, map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { Hotkey } from 'src/app/shared/services/hotkeys.service';
import type { AppState } from 'src/app/state/app.state';
import { selectOwnClientId } from 'src/app/state/application/selectors/application.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { createSelectBehaviorStates } from 'src/app/state/application/selectors/exercise.selectors';
import {
    setLoadingState,
    type InterfaceSignallerInteraction,
} from '../signaller-modal-interactions/signaller-modal-interactions.component';
import { SignallerModalDetailsService } from '../details-modal/signaller-modal-details.service';

@Component({
    selector: 'app-signaller-modal-region-information',
    templateUrl: './signaller-modal-region-information.component.html',
    styleUrls: ['./signaller-modal-region-information.component.scss'],
})
export class SignallerModalRegionInformationComponent
    implements OnInit, OnChanges
{
    @Input()
    simulatedRegionId!: UUID;

    @ViewChild('recurringReportEditor')
    recurringReportEditor!: TemplateRef<any>;

    informationTypeToEdit: ReportableInformation | null = null;

    private clientId!: UUID;

    informationInteractions: InterfaceSignallerInteraction[] = [
        {
            key: 'patientCount',
            name: 'Anzahl Patienten',
            details: 'nach Sichtungskategorie',
            keywords: [
                'patient',
                'patienten',
                'zahl',
                'anzahl',
                'zahlen',
                'zählen',
                'menge',
            ],
            hotkey: new Hotkey('A', false, () => this.requestPatientCount()),
            secondaryHotkey: new Hotkey('⇧ + A', true, () =>
                this.openRecurringReportModal('patientCount')
            ),
            requiredBehaviors: ['treatPatientsBehavior'],
            errorMessage: 'Dieser Bereich behandelt keine Patienten',
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'transportProgressFull',
            name: 'Transportfortschritt',
            keywords: [
                'transport',
                'krankenhaus',
                'fortschritt',
                'status',
                'abtransport',
            ],
            details: 'für alle Bereiche',
            hotkey: new Hotkey('B', false, () =>
                this.requestFullTransportProgress()
            ),
            secondaryHotkey: new Hotkey('⇧ + B', true, () =>
                this.openRecurringReportModal(
                    'transportManagementTransferCounts'
                )
            ),
            requiredBehaviors: ['managePatientTransportToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'transportProgressRegion',
            name: 'Transportfortschritt',
            keywords: [
                'transport',
                'krankenhaus',
                'fortschritt',
                'status',
                'abtransport',
            ],
            details: 'für diesen Bereich',
            hotkey: new Hotkey('C', false, () =>
                this.requestRegionTransportProgress()
            ),
            secondaryHotkey: new Hotkey('⇧ + C', true, () =>
                this.openRecurringReportModal('singleRegionTransferCounts')
            ),
            requiredBehaviors: ['transferToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'vehicleCount',
            name: 'Anzahl Fahrzeuge',
            keywords: [
                'fahrzeug',
                'fahrzeuge',
                'zahl',
                'anzahl',
                'zahlen',
                'zählen',
                'menge',
            ],
            details: 'nach Typ',
            hotkey: new Hotkey('D', false, () => this.requestVehicleCount()),
            secondaryHotkey: new Hotkey('⇧ + D', true, () =>
                this.openRecurringReportModal('vehicleCount')
            ),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'requiredResources',
            name: 'Benötigte Fahrzeuge',
            keywords: [
                'patient',
                'patienten',
                'zahl',
                'anzahl',
                'zahlen',
                'menge',
                'benötigt',
                'bedarf',
                'notwendig',
                'erfordert',
                'erforderlich',
            ],
            details:
                'um alle Patienten zu behandeln (PA) oder Anfragen zu erfüllen (B-Raum)',
            hotkey: new Hotkey('E', false, () =>
                this.requestRequiredResources()
            ),
            secondaryHotkey: new Hotkey('⇧ + E', true, () =>
                this.openRecurringReportModal('requiredResources')
            ),
            requiredBehaviors: ['requestBehavior'],
            errorMessage:
                'Dieser Bereich benötigt keine Fahrzeuge für seine Arbeit',
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Arriving vehicles (number, ETA)
        {
            key: 'treatmentStatus',
            name: 'Behandlungsstatus',
            keywords: [
                'behandlung',
                'patient',
                'patienten',
                'sichten',
                'zählen',
                'versorgung',
                'erstversorgung',
                'sicher',
                'sichergestellt',
                'status',
                'fortschritt',
                'zustand',
            ],
            details: '(Erstversorgung sichergestellt?)',
            hotkey: new Hotkey('F', false, () => this.requestTreatmentStatus()),
            secondaryHotkey: new Hotkey('⇧ + F', true, () =>
                this.openRecurringReportModal('treatmentStatus')
            ),
            requiredBehaviors: ['treatPatientsBehavior'],
            errorMessage: 'Dieser Bereich behandelt keine Patienten',
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Location
        // TODO: Vehicle occupation
        {
            key: 'transferConnections',
            name: 'Bekannte Standorte anderer Bereiche',
            keywords: [
                'transfer',
                'transport',
                'verbindung',
                'verbinden',
                'verbunden',
                'bekannt',
                'kennt',
                'nachbar',
                'erreichbar',
                'erreichen',
                'bereich',
                'bereiche',
                'abschnitt',
                'abschnitte',
            ],
            details:
                '(welche anderen Bereiche sind bekannt, sodass z.B. Fahrzeuge dorthin fahren können?)',
            hotkey: new Hotkey('G', false, () =>
                this.requestTransferConnections()
            ),
            secondaryHotkey: new Hotkey('⇧ + G', true, () =>
                this.openRecurringReportModal('transferConnections')
            ),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Patient treatments
        {
            key: 'personnelCount',
            name: 'Anzahl Personal',
            keywords: [
                'personal',
                'personen',
                'zahl',
                'anzahl',
                'zahlen',
                'zählen',
                'menge',
            ],
            details: 'nach Typ',
            hotkey: new Hotkey('H', false, () => this.requestPersonnelCount()),
            secondaryHotkey: new Hotkey('⇧ + H', true, () =>
                this.openRecurringReportModal('personnelCount')
            ),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Patient details
    ];
    reportBehaviorId$!: Observable<UUID | null>;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly detailsModal: SignallerModalDetailsService
    ) {}

    ngOnInit() {
        this.clientId = selectStateSnapshot(selectOwnClientId, this.store)!;
    }

    ngOnChanges() {
        const behaviors$ = this.store.select(
            createSelectBehaviorStates(this.simulatedRegionId)
        );

        this.reportBehaviorId$ = behaviors$.pipe(
            map(
                (behaviors) =>
                    behaviors.find(
                        (behavior) => behavior.type === 'reportBehavior'
                    )?.id ?? null
            )
        );
    }

    public openRecurringReportModal(informationType: ReportableInformation) {
        this.informationTypeToEdit = informationType;

        this.detailsModal.open(
            'Automatischen Bericht bearbeiten',
            this.recurringReportEditor
        );
    }

    public requestPatientCount() {
        this.requestSimpleReport('patientCount', 'patientCount');
    }

    public requestFullTransportProgress() {
        this.requestSimpleReport(
            'transportManagementTransferCounts',
            'transportProgressFull'
        );
    }

    public requestRegionTransportProgress() {
        this.requestSimpleReport(
            'singleRegionTransferCounts',
            'transportProgressRegion'
        );
    }

    public requestRequiredResources() {
        this.requestSimpleReport('requiredResources', 'requiredResources');
    }

    public requestVehicleCount() {
        this.requestSimpleReport('vehicleCount', 'vehicleCount');
    }

    public requestTreatmentStatus() {
        this.requestSimpleReport('treatmentStatus', 'treatmentStatus');
    }

    public requestTransferConnections() {
        this.requestSimpleReport('transferConnections', 'transferConnections');
    }

    public requestPersonnelCount() {
        this.requestSimpleReport('personnelCount', 'personnelCount');
    }

    /**
     * Requests an information trough the report behavior
     * @param informationType The information to be requested
     */
    requestSimpleReport(informationType: ReportableInformation, key: string) {
        if (this.requestBlocked(key)) return;

        setLoadingState(this.informationInteractions, key, true);

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
            this.informationInteractions
                .find((information) => information.key === key)
                ?.loading$?.getValue() ?? false
        );
    }
}
