import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    Material,
    Patient,
    Personell,
    uuid,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import { map } from 'rxjs';
import { ApiService } from './core/api.service';
import type { AppState } from './state/app.state';
import {
    selectMaterials,
    selectPatients,
    selectPersonell,
    selectVehicles,
} from './state/exercise/exercise.selectors';

const getNumberOf = map((dictionary: object) => Object.keys(dictionary).length);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public exerciseId = 'abcdefghijk';

    public readonly numberOfPatients$ = this.store
        .select(selectPatients)
        .pipe(getNumberOf);
    public readonly numberOfVehicles$ = this.store
        .select(selectVehicles)
        .pipe(getNumberOf);
    public readonly numberOfPersonell$ = this.store
        .select(selectPersonell)
        .pipe(getNumberOf);
    public readonly numberOfMaterials$ = this.store
        .select(selectMaterials)
        .pipe(getNumberOf);

    constructor(
        public readonly apiService: ApiService,
        private readonly store: Store<AppState>
    ) {}

    private generateCoordinates() {
        const xOffset = Math.random() * 100;
        const yOffset = Math.random() * 250;
        return {
            x: 1461830 + xOffset,
            y: 6871673 + yOffset,
        };
    }

    // Action
    public async addPatient() {
        const patient = {
            ...new Patient(
                { hair: 'brown', eyeColor: 'blue', name: 'John Doe', age: 42 },
                'green',
                'green',
                Date.now().toString()
            ),
            position: this.generateCoordinates(),
            vehicleId: uuid(),
        };
        this.apiService.proposeAction(
            {
                type: '[Patient] Add patient',
                patient,
            },
            true
        );
    }

    public async addVehicle() {
        const vehicle = {
            ...new Vehicle(uuid(), 1, 'name'),
            position: this.generateCoordinates(),
        };
        this.apiService.proposeAction(
            {
                type: '[Vehicle] Add vehicle',
                vehicle,
            },
            true
        );
    }
    public async addPersonell() {
        const personell = {
            ...new Personell(uuid(), 'retSan', {}),
            position: this.generateCoordinates(),
        };
        this.apiService.proposeAction(
            {
                type: '[Personell] Add personell',
                personell,
            },
            true
        );
    }

    public async addMaterial() {
        const material = {
            ...new Material(
                uuid(),
                {},
                {
                    green: 2,
                    red: 1,
                    yellow: 1,
                    logicalOperator: 'and',
                }
            ),
            position: this.generateCoordinates(),
        };
        this.apiService.proposeAction(
            {
                type: '[Material] Add material',
                material,
            },
            true
        );
    }

    public addMultiple(
        numberOfElements: number,
        key: 'addMaterial' | 'addPatient' | 'addPersonell' | 'addVehicle'
    ) {
        for (let i = 0; i < numberOfElements; i++) {
            this[key]();
        }
    }

    public joinExercise() {
        this.apiService.joinExercise(this.exerciseId);
    }
}
