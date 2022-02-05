import { Input, Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { openClientOverviewModal } from '../client-overview/open-client-overview-modal';

@Component({
    selector: 'app-trainer-toolbar',
    templateUrl: './trainer-toolbar.component.html',
    styleUrls: ['./trainer-toolbar.component.scss'],
})
export class TrainerToolbarComponent {
    @Input() exerciseId!: string;

    constructor(private readonly modalService: NgbModal) {}

    public openClientOverview() {
        openClientOverviewModal(this.modalService, this.exerciseId!);
    }
}
