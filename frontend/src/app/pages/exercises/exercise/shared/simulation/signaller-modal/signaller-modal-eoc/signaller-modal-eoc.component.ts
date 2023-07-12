import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Hotkey } from 'src/app/shared/services/hotkeys.service';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { InterfaceSignallerInteraction } from '../signaller-modal-interactions/signaller-modal-interactions.component';
import { SignallerModalDetailsService } from '../details-modal/signaller-modal-details.service';

@Component({
    selector: 'app-signaller-modal-eoc',
    templateUrl: './signaller-modal-eoc.component.html',
    styleUrls: ['./signaller-modal-eoc.component.scss'],
})
export class SignallerModalEocComponent {
    @ViewChild('alarmGroupsSentDisplay')
    alarmGroupsSentDisplay!: TemplateRef<any>;
    @ViewChild('arrivingVehiclesDisplay')
    arrivingVehiclesDisplay!: TemplateRef<any>;

    informationInteractions: InterfaceSignallerInteraction[] = [
        {
            key: 'alarmGroupsSent',
            name: 'Alarmierte Alarmgruppen',
            keywords: [
                'alarm',
                'gruppe',
                'gruppen',
                'alarmgruppe',
                'alarmgruppen',
                'alarmiert',
                'ausgelöst',
                'gestartet',
                'gesendet',
            ],
            hotkey: new Hotkey('A', false, () => this.requestAlarmGroupsSent()),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
        {
            key: 'arrivingVehicles',
            name: 'Fahrzeuge auf Anfahrt',
            keywords: [
                'fahrzeug',
                'fahrzeuge',
                'fahren',
                'anfahrt',
                'kommen',
                'ankommen',
                'anfahren',
                'ankunft',
            ],
            hotkey: new Hotkey('B', false, () =>
                this.requestArrivingVehicles()
            ),
            requiredBehaviors: [],
            loading$: new BehaviorSubject<boolean>(false),
        },
    ];

    constructor(
        private readonly store: Store<AppState>,
        private readonly detailsModal: SignallerModalDetailsService
    ) {}

    requestAlarmGroupsSent() {
        this.detailsModal.open(
            'Bereit alarmierte Alarmgruppen',
            this.alarmGroupsSentDisplay
        );
    }

    requestArrivingVehicles() {
        this.detailsModal.open(
            'Fahrzeuge auf Anfahrt',
            this.arrivingVehiclesDisplay
        );
    }
}
