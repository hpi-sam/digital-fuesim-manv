import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-signaller-modal',
    templateUrl: './signaller-modal.component.html',
    styleUrls: ['./signaller-modal.component.scss'],
})
export class SignallerModalComponent {
    @Input()
    currentSimulatedRegionId!: UUID;

    constructor(public readonly activeModal: NgbActiveModal) {}

    public close() {
        this.activeModal.close();
    }
}
