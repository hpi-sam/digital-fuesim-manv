import { Component, Input } from '@angular/core';
import { UUID } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-signaller-modal-region-overview',
    templateUrl: './signaller-modal-region-overview.component.html',
    styleUrls: ['./signaller-modal-region-overview.component.scss'],
})
export class SignallerModalRegionOverviewComponent {
    @Input() simulatedRegionId!: UUID;
}
