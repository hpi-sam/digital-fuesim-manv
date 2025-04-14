import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-client-overview-modal',
    templateUrl: './client-overview-modal.component.html',
    styleUrls: ['./client-overview-modal.component.scss'],
    standalone: false,
})
export class ClientOverviewModalComponent {
    constructor(public activeModal: NgbActiveModal) {}

    public close() {
        this.activeModal.close();
    }
}
