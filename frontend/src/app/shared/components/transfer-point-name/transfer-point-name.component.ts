import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { TransferPoint } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectTransferPoint } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-transfer-point-name',
    templateUrl: './transfer-point-name.component.html',
    styleUrls: ['./transfer-point-name.component.scss'],
})
export class TransferPointNameComponent implements OnChanges {
    @Input() transferPointId!: UUID;

    public transferPoint$?: Observable<TransferPoint>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnChanges() {
        this.transferPoint$ = this.store.select(
            createSelectTransferPoint(this.transferPointId)
        );
    }
}
