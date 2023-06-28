import type { OnChanges } from '@angular/core';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { UUID, isInSpecificSimulatedRegion } from 'digital-fuesim-manv-shared';
import { Hotkey } from 'src/app/shared/services/hotkeys.service';
import { Store, createSelector } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Observable } from 'rxjs';
import { selectTransferPoints } from 'src/app/state/application/selectors/exercise.selectors';
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

    ownTransferPointId$!: Observable<UUID>;

    commandInteractions: InterfaceSignallerInteraction[] = [
        {
            key: 'editTransferConnections',
            title: 'Lage eines Bereichs',
            details: '(stellt eine Transferverbindung her)',
            hotkey: new Hotkey('A', true, () => this.editTransferConnections()),
            requiredBehaviors: [],
        },
        {
            key: 'startTransportOfCategory',
            title: 'Patienten abtransportieren',
            details: '(nur eine Sichtungskategorie)',
            hotkey: new Hotkey('B', false, () =>
                this.startTransportOfCategory()
            ),
            requiredBehaviors: ['managePatientTransportToHospitalBehavior'],
            errorMessage: 'Dieser Bereich verwaltet keine Transporte',
        },
        {
            key: 'provideVehicles',
            title: 'Fahrzeuge bereitstellen',
            details: '(entsendet Fahrzeuge in einen anderen Bereich)',
            hotkey: new Hotkey('C', false, () =>
                this.editTransferConnections()
            ),
            requiredBehaviors: [],
        },
        // TODO: Radio channels
        // TODO: Recurring reports
        {
            key: 'provideVehicles',
            title: 'Fahrzeuge bereitstellen',
            details: '(entsendet Fahrzeuge in einen anderen Bereich)',
            hotkey: new Hotkey('C', false, () =>
                this.editTransferConnections()
            ),
            requiredBehaviors: [],
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
    }

    editTransferConnections() {
        this.detailsModal.open(
            'Transferverbindungen bearbeiten',
            this.transferConnectionsEditor
        );
    }

    startTransportOfCategory() {
        //
    }
}
