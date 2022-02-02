import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UUID } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-vehicle-popup',
    templateUrl: './vehicle-popup.component.html',
    styleUrls: ['./vehicle-popup.component.scss'],
})
export class VehiclePopupComponent {
    @Input() vehicleId!: UUID;
    @Output() readonly closePopup = new EventEmitter<void>();
}
