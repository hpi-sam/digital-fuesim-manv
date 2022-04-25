import { Component, Input } from '@angular/core';
import { TransferPoint } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-transfer-point-name',
    templateUrl: './transfer-point-name.component.html',
    styleUrls: ['./transfer-point-name.component.scss'],
})
export class TransferPointNameComponent {
    @Input() transferPoint!: TransferPoint;
}
