import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StatisticsTimeSelectionService {
    public readonly selectedTime$ = new BehaviorSubject<
        { time: number; cause: 'chart' | 'log' } | undefined
    >(undefined);

    public selectTime(time: number, cause: 'chart' | 'log') {
        this.selectedTime$.next({ time, cause });
    }

    public clearSelection() {
        this.selectedTime$.next(undefined);
    }
}
