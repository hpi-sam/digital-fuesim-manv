import { Component, Input } from '@angular/core';
import { LogEntry } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-log-entry',
    templateUrl: './log-entry.component.html',
    styleUrls: ['./log-entry.component.scss'],
})
export class LogEntryComponent {
    @Input() logEntry!: LogEntry;
}
