import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { TransferCountsRadiogram } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectRadiogram } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-radiogram-card-content-transfer-counts',
    templateUrl: './radiogram-card-content-transfer-counts.component.html',
    styleUrls: ['./radiogram-card-content-transfer-counts.component.scss'],
})
export class RadiogramCardContentTransferCountsComponent implements OnInit {
    @Input() radiogramId!: UUID;

    radiogram$!: Observable<TransferCountsRadiogram>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.radiogram$ = this.store.select(
            createSelectRadiogram<TransferCountsRadiogram>(this.radiogramId)
        );
    }
}
