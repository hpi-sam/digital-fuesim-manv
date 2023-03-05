import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ExerciseSimulationBehaviorState } from 'digital-fuesim-manv-shared';

const behaviorToGermanNameDictionary = {
    assignLeaderBehavior: 'Führung zuweisen',
    treatPatientsBehavior: 'Patienten behandeln',
    unloadArrivingVehiclesBehavior: 'Fahrzeuge entladen',
};
@Pipe({
    name: 'behaviorToGermanName',
})
export class BehaviorToGermanNamePipe implements PipeTransform {
    transform(value: ExerciseSimulationBehaviorState): string {
        return behaviorToGermanNameDictionary[value.type];
    }
}
