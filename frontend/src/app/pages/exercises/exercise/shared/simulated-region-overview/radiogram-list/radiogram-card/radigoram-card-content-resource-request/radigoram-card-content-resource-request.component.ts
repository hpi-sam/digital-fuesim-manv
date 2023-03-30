import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type {
    ResourceRequestRadiogram,
    VehicleResource,
} from 'digital-fuesim-manv-shared';
import { UUID, isAccepted } from 'digital-fuesim-manv-shared';
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

    requiredResource$!: Observable<VehicleResource>;
    enableActionButtons$!: Observable<boolean>;

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
        this.requiredResource$ = this.store.select(
            createSelector(
                selectRadiogram,
                (radiogram) => radiogram.requiredResource
            )
        );
        this.enableActionButtons$ = this.store.select(
            createSelector(selectRadiogram, (radiogram) =>
                isAccepted(radiogram)
            )
        );
    }
}
