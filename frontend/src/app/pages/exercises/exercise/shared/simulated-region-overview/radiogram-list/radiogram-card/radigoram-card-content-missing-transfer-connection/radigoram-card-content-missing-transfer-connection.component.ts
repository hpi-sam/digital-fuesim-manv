import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { MissingTransferConnectionRadiogram } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { combineLatest, map } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectRadiogram,
    selectTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-radigoram-card-content-missing-transfer-connection',
    templateUrl:
        './radigoram-card-content-missing-transfer-connection.component.html',
    styleUrls: [
        './radigoram-card-content-missing-transfer-connection.component.scss',
    ],
})
export class RadigoramCardContentMissingTransferConnectionComponent
    implements OnInit
{
    @Input() radiogramId!: UUID;

    transferPointName$!: Observable<string>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        const radiogram$ = this.store.select(
            createSelectRadiogram<MissingTransferConnectionRadiogram>(
                this.radiogramId
            )
        );

        const transferPoints$ = this.store.select(selectTransferPoints);

        this.transferPointName$ = combineLatest([
            radiogram$,
            transferPoints$,
        ]).pipe(
            map(
                ([radiogram, transferPoints]) =>
                    transferPoints[radiogram.targetTransferPointId]
                        ?.externalName ?? 'Unbekannt'
            )
        );
    }
}
