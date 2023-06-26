import { Component, Input } from '@angular/core';
import { UUID } from 'digital-fuesim-manv-shared';
import { Hotkey } from 'src/app/shared/services/hotkeys.service';
import type { InterfaceSignallerInteraction } from '../signaller-modal-interactions/signaller-modal-interactions.component';

@Component({
    selector: 'app-signaller-modal-region-commands',
    templateUrl: './signaller-modal-region-commands.component.html',
    styleUrls: ['./signaller-modal-region-commands.component.scss'],
})
export class SignallerModalRegionCommandsComponent {
    @Input()
    simulatedRegionId!: UUID;

    commandInteractions: InterfaceSignallerInteraction[] = [
        {
            key: 'editTransferConnections',
            title: 'Lage eines Bereichs',
            details: '(stellt eine Transferverbindung her)',
            hotkey: new Hotkey('A', true, () =>
                // this.editTransferConnections()
                console.log('YYY')
            ),
            requiredBehaviors: [],
        },
        {
            key: 'startTransportOfCategory',
            title: 'Patienten abtransportieren',
            details: '(nur eine Sichtungskategorie)',
            hotkey: new Hotkey('B', false, () =>
                this.editTransferConnections()
            ),
            requiredBehaviors: [],
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

    public editTransferConnections() {
        //
    }
}
