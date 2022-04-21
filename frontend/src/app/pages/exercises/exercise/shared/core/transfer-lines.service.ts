import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TransferLinesService {
    /**
     * Whether the TransferLines should be displayed or not.
     */
    public get displayTransferLines() {
        return this._displayTransferLines;
    }
    public set displayTransferLines(value: boolean) {
        this._displayTransferLines = value;
        this.displayTransferLines$.next(value);
    }
    private _displayTransferLines = false;
    /**
     * The BehaviorSubject that emits the current value of the displayTransferLines property.
     */
    public displayTransferLines$ = new BehaviorSubject(
        this._displayTransferLines
    );
}
