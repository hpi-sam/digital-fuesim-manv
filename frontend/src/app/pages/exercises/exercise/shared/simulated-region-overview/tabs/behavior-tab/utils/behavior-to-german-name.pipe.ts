import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type {
    ExerciseSimulationBehaviorState,
    ExerciseSimulationBehaviorType,
} from 'digital-fuesim-manv-shared';

const behaviorToGermanNameDictionary: {
    [Key in ExerciseSimulationBehaviorState['type']]: string;
} = {
    assignLeaderBehavior: 'Führung zuweisen',
    treatPatientsBehavior: 'Patienten behandeln',
    unloadArrivingVehiclesBehavior: 'Fahrzeuge entladen',
    reportBehavior: 'Berichte erstellen',
};
@Pipe({
    name: 'behaviorToGermanName',
})
export class BehaviorTypeToGermanNamePipe implements PipeTransform {
    transform(value: ExerciseSimulationBehaviorType): string {
        return behaviorToGermanNameDictionary[value];
    }
}
