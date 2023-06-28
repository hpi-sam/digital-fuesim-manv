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
import { SignallerModalDetailsService } from '../signaller-modal-details.service';

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
            title: 'Anzahl Patienten',
            details: 'nach Sichtungskategorie',
            hotkey: new Hotkey('1', false, () => this.requestPatientCount()),
            secondaryHotkey: new Hotkey('Shift + 1', true, () =>
                this.openRecurringReportModal('patientCount')
            ),
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
            secondaryHotkey: new Hotkey('Shift + 2', true, () =>
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
            title: 'Transportfortschritt',
            details: 'für diesen Bereich',
            hotkey: new Hotkey('3', false, () =>
                this.requestRegionTransportProgress()
            ),
            secondaryHotkey: new Hotkey('Shift + 3', true, () =>
                this.openRecurringReportModal('singleRegionTransferCounts')
            ),
            requiredBehaviors: ['transferToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'vehicleCount',
            title: 'Anzahl Fahrzeuge',
            details: 'nach Typ',
            hotkey: new Hotkey('4', false, () => this.requestVehicleCount()),
            secondaryHotkey: new Hotkey('Shift + 4', true, () =>
                this.openRecurringReportModal('vehicleCount')
            ),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'requiredResources',
            title: 'Benötigte Fahrzeuge',
            details:
                'um alle Patienten zu behandeln (PA) oder Anfragen zu erfüllen (B-Raum)',
            hotkey: new Hotkey('5', false, () =>
                this.requestRequiredResources()
            ),
            secondaryHotkey: new Hotkey('Shift + 5', true, () =>
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
            title: 'Behandlungsstatus',
            details: '(Erstversorgung sichergestellt?)',
            hotkey: new Hotkey('6', false, () => this.requestTreatmentStatus()),
            secondaryHotkey: new Hotkey('Shift + 6', true, () =>
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
            title: 'Transferverbindungen',
            details: 'zu anderen Bereichen',
            hotkey: new Hotkey('7', false, () =>
                this.requestTransferConnections()
            ),
            secondaryHotkey: new Hotkey('Shift + 7', true, () =>
                this.openRecurringReportModal('transferConnections')
            ),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Patient treatments
        {
            key: 'personnelCount',
            title: 'Anzahl Personal',
            details: 'nach Typ',
            hotkey: new Hotkey('8', false, () => this.requestPersonnelCount()),
            secondaryHotkey: new Hotkey('Shift + 8', true, () =>
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
