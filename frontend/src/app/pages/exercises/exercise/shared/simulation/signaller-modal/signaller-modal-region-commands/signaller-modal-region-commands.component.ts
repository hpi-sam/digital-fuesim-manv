import type { OnChanges } from '@angular/core';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import type { ExerciseSimulationBehaviorType } from 'digital-fuesim-manv-shared';
import { UUID, isInSpecificSimulatedRegion } from 'digital-fuesim-manv-shared';
import { Hotkey } from 'src/app/shared/services/hotkeys.service';
import { Store, createSelector } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { map, type Observable } from 'rxjs';
import {
    createSelectBehaviorStatesByType,
    selectTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';
import { SignallerModalDetailsService } from '../details-modal/signaller-modal-details.service';
import type { InterfaceSignallerInteraction } from '../signaller-modal-interactions/signaller-modal-interactions.component';

@Component({
    selector: 'app-signaller-modal-region-commands',
    templateUrl: './signaller-modal-region-commands.component.html',
    styleUrls: ['./signaller-modal-region-commands.component.scss'],
})
export class SignallerModalRegionCommandsComponent implements OnChanges {
    @Input()
    simulatedRegionId!: UUID;

    @ViewChild('transferConnectionsEditor')
    transferConnectionsEditor!: TemplateRef<any>;
    @ViewChild('transferTraysEditor')
    transferTraysEditor!: TemplateRef<any>;
    @ViewChild('transportOfCategoryEditor')
    transportOfCategoryEditor!: TemplateRef<any>;
    @ViewChild('provideVehiclesEditor')
    provideVehiclesEditor!: TemplateRef<any>;
    @ViewChild('requestTargetEditor')
    requestTargetEditor!: TemplateRef<any>;

    ownTransferPointId$!: Observable<UUID>;
    manageTransportBehaviorId$!: Observable<UUID | null>;
    transferVehiclesBehaviorId$!: Observable<UUID | null>;
    requestBehaviorId$!: Observable<UUID | null>;

    commandInteractions: InterfaceSignallerInteraction[] = [
        {
            key: 'editTransferConnections',
            title: 'Lage eines Bereichs',
            details: '(stellt eine Transferverbindung her)',
            hotkey: new Hotkey('A', true, () => this.editTransferConnections()),
            requiredBehaviors: [],
        },
        {
            key: 'editTransferPatientTrays',
            title: 'PAs für Abtransport festlegen',
            details:
                '(aus welchen Patientenablagen sollen Patienten ins Krankenhaus gebracht werden)',
            hotkey: new Hotkey('B', true, () =>
                this.editTransferPatientTrays()
            ),
            requiredBehaviors: ['managePatientTransportToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
        },
        {
            key: 'startTransportOfCategory',
            title: 'Patienten abtransportieren',
            details: '(nur eine Sichtungskategorie)',
            hotkey: new Hotkey('C', false, () =>
                this.startTransportOfCategory()
            ),
            requiredBehaviors: ['managePatientTransportToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
        },
        {
            key: 'provideVehicles',
            title: 'Fahrzeuge bereitstellen',
            details: '(entsendet Fahrzeuge in einen anderen Bereich)',
            hotkey: new Hotkey('D', false, () => this.provideVehicles()),
            requiredBehaviors: ['transferBehavior'],
            errorMessage: 'Dieser Bereich kann keine Fahrzeuge bereitstellen',
        },
        // TODO: Radio channels
        {
            key: 'setRequestTarget',
            title: 'Ziel für Fahrzeuganfragen festlegen',
            details:
                '(ob Fahrzeuge bei Einsatzleitung oder B-Raum angefragt werden sollen)',
            hotkey: new Hotkey('E', false, () => this.setRequestTarget()),
            requiredBehaviors: ['requestBehavior'],
            errorMessage: 'Dieser Bereich fragt keine Fahrzeuge an',
        },
    ];

    constructor(
        private readonly store: Store<AppState>,
        private readonly detailsModal: SignallerModalDetailsService
    ) {}

    ngOnChanges() {
        this.ownTransferPointId$ = this.store.select(
            createSelector(
                selectTransferPoints,
                (transferPoints) =>
                    Object.values(transferPoints).find((transferPoint) =>
                        isInSpecificSimulatedRegion(
                            transferPoint,
                            this.simulatedRegionId
                        )
                    )!.id
            )
        );

        this.manageTransportBehaviorId$ = this.selectBehaviorId(
            'managePatientTransportToHospitalBehavior'
        );

        this.transferVehiclesBehaviorId$ =
            this.selectBehaviorId('transferBehavior');

        this.requestBehaviorId$ = this.selectBehaviorId('requestBehavior');
    }

    selectBehaviorId(type: ExerciseSimulationBehaviorType) {
        return this.store
            .select(
                createSelectBehaviorStatesByType(this.simulatedRegionId, type)
            )
            .pipe(map((behaviorStates) => behaviorStates[0]?.id ?? null));
    }

    editTransferConnections() {
        this.detailsModal.open(
            'Transferverbindungen bearbeiten',
            this.transferConnectionsEditor
        );
    }

    editTransferPatientTrays() {
        this.detailsModal.open(
            'PAs für Abtransport festlegen',
            this.transferTraysEditor
        );
    }

    startTransportOfCategory() {
        this.detailsModal.open(
            'Abtransport einer bestimmten Sichtungskategorie',
            this.transportOfCategoryEditor
        );
    }

    provideVehicles() {
        this.detailsModal.open(
            'Fahrzeuge bereitstellen',
            this.provideVehiclesEditor
        );
    }

    setRequestTarget() {
        this.detailsModal.open(
            'Ziel für Fahrzeuganfragen',
            this.requestTargetEditor
        );
    }
}
