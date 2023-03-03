import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ExerciseSimulationBehaviorState } from 'digital-fuesim-manv-shared';

@Pipe({
    name: 'behaviorToGermanName',
})
export class BehaviorToGermanNamePipe implements PipeTransform {
    transform(value: ExerciseSimulationBehaviorState): string {
        switch (value.type) {
            case 'assignLeaderBehavior':
                return 'Führung zuweisen';

            case 'treatPatientsBehavior':
                return 'Patienten behandeln';

            case 'unloadArrivingVehiclesBehavior':
                return 'Fahrzeuge entladen';
        }
    }
}