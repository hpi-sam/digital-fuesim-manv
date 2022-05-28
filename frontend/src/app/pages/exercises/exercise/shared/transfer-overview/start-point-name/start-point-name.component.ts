import { Component, Input } from '@angular/core';
import type {
    AlarmGroupStartPoint,
    TransferStartPoint,
} from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-start-point-name',
    templateUrl: './start-point-name.component.html',
    styleUrls: ['./start-point-name.component.scss'],
})
export class StartPointNameComponent {
    @Input() startPoint!: AlarmGroupStartPoint | TransferStartPoint;
}
