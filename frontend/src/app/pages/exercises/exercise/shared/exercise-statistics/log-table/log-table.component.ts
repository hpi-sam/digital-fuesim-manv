import { Component, Input } from '@angular/core';
import type { LogEntry } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-log-table',
    templateUrl: './log-table.component.html',
    styleUrls: ['./log-table.component.scss'],
})
export class LogTableComponent {
    @Input() public logEntries!: readonly LogEntry[];
}
