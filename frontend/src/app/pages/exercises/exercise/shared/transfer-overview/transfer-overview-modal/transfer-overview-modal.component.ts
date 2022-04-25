import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-transfer-overview-modal',
    templateUrl: './transfer-overview-modal.component.html',
    styleUrls: ['./transfer-overview-modal.component.scss'],
})
export class TransferOverviewModalComponent {
    constructor(public activeModal: NgbActiveModal) {}

    public close() {
        this.activeModal.close();
    }
}
