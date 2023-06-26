import type { OnChanges, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
    setLoadingState,
    type InterfaceSignallerInteraction,
} from '../signaller-modal-interactions/signaller-modal-interactions.component';
import { openSimulationSignallerModalRecurringReportModal } from '../open-simulation-signaller-modal-recurring-report-modal';

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

    private clientId!: UUID;

    informationInteractions: InterfaceSignallerInteraction[] = [
        {
            key: 'patientCount',
            title: 'Anzahl Patienten',
            details: 'nach Sichtungskategorie',
            hotkey: new Hotkey('1', false, () => this.requestPatientCount()),
            secondaryHotkey: new Hotkey('Shift + 1', true, () =>
                openSimulationSignallerModalRecurringReportModal(
                    this.modalService,
                    this.simulatedRegionId,
                    'patientCount'
                )
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
            requiredBehaviors: ['transferToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'vehicleCount',
            title: 'Anzahl Fahrzeuge',
            details: 'nach Typ',
            hotkey: new Hotkey('4', false, () => this.requestVehicleCount()),
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
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Patient treatments
        {
            key: 'personnelCount',
            title: 'Anzahl Personal',
            details: 'nach Typ',
            hotkey: new Hotkey('8', false, () => this.requestPersonnelCount()),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        // TODO: Patient details
    ];
    hasReportBehavior$!: Observable<boolean>;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly modalService: NgbModal
    ) {}

    ngOnInit() {
        this.clientId = selectStateSnapshot(selectOwnClientId, this.store)!;
    }

    ngOnChanges() {
        const behaviors$ = this.store.select(
            createSelectBehaviorStates(this.simulatedRegionId)
        );

        this.hasReportBehavior$ = behaviors$.pipe(
            map((behaviors) =>
                behaviors.some((behavior) => behavior.type === 'reportBehavior')
            )
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
