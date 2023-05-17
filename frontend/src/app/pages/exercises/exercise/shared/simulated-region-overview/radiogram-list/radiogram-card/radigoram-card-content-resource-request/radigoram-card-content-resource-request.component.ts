import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { ResourceRequestRadiogram } from 'digital-fuesim-manv-shared';
import { UUID, isAccepted, isDone } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { createSelectRadiogram } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-radigoram-card-content-resource-request',
    templateUrl: './radigoram-card-content-resource-request.component.html',
    styleUrls: ['./radigoram-card-content-resource-request.component.scss'],
})
export class RadigoramCardContentResourceRequestComponent implements OnInit {
    @Input() radiogramId!: UUID;

    radiogram$!: Observable<ResourceRequestRadiogram>;
    enableActionButtons$!: Observable<boolean>;
    showAnswer$!: Observable<boolean>;

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    acceptRequest() {
        this.exerciseService.proposeAction({
            type: '[Radiogram] Accept resource request',
            radiogramId: this.radiogramId,
        });
    }

    denyRequest() {
        this.exerciseService.proposeAction({
            type: '[Radiogram] Deny resource request',
            radiogramId: this.radiogramId,
        });
    }

    ngOnInit(): void {
        const selectRadiogram = createSelectRadiogram<ResourceRequestRadiogram>(
            this.radiogramId
        );
        this.radiogram$ = this.store.select(selectRadiogram);
        this.enableActionButtons$ = this.store.select(
            createSelector(selectRadiogram, (radiogram) =>
                isAccepted(radiogram)
            )
        );
        this.showAnswer$ = this.store.select(
            createSelector(selectRadiogram, (radiogram) => isDone(radiogram))
        );
    }
}
