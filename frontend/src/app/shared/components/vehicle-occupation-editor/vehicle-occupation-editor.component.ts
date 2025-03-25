import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { UUID, NoOccupation } from 'digital-fuesim-manv-shared';
import type {
    ExerciseOccupation,
    ExerciseOccupationType,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { ExerciseService } from 'src/app/core/exercise.service';
import { createSelectVehicle } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-vehicle-occupation-editor',
    templateUrl: './vehicle-occupation-editor.component.html',
    styleUrls: ['./vehicle-occupation-editor.component.scss'],
    standalone: false,
})
export class VehicleOccupationEditorComponent implements OnChanges {
    @Input() vehicleId!: UUID;
    occupation$!: Observable<ExerciseOccupation>;
    public occupationToGermanDictionary: {
        [key in ExerciseOccupationType]: string;
    } = {
        noOccupation: 'Das Fahrzeug wird nicht genutzt',
        intermediateOccupation: 'Das Fahrzeug wird gerade übergeben',
        unloadingOccupation: 'Das Fahrzeug wird gerade ausgeladen',
        loadOccupation: 'Das Fahrzeug wird gerade beladen',
        waitForTransferOccupation: 'Das Fahrzeug wartet auf den Transfer',
        patientTransferOccupation:
            'Das Fahrzeug ist für den Transport von Patienten ins Krankenhaus reserviert',
    };

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    ngOnChanges() {
        this.occupation$ = this.store
            .select(createSelectVehicle(this.vehicleId))
            .pipe(map((vehicle) => vehicle.occupation));
    }

    cancelOccupation() {
        this.exerciseService.proposeAction({
            type: '[Vehicle] Set occupation',
            vehicleId: this.vehicleId,
            occupation: NoOccupation.create(),
        });
    }
}
