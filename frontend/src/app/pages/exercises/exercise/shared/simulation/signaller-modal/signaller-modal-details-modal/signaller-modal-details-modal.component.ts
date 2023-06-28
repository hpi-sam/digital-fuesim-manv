import { Component, Input, TemplateRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-signaller-modal-details-modal',
    templateUrl: './signaller-modal-details-modal.component.html',
    styleUrls: ['./signaller-modal-details-modal.component.scss'],
})
export class SignallerModalDetailsModalComponent {
    @Input() title = '';
    @Input() body!: TemplateRef<any>;

    constructor(private readonly activeModal: NgbActiveModal) {}

    public close() {
        this.activeModal.close();
    }
}
