import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ExerciseSimulationBehaviorState } from 'digital-fuesim-manv-shared';

const behaviorToGermanNameDictionary: {
    [Key in ExerciseSimulationBehaviorState['type']]: string;
} = {
    assignLeaderBehavior: 'Führung zuweisen',
    treatPatientsBehavior: 'Patienten behandeln',
    unloadArrivingVehiclesBehavior: 'Fahrzeuge entladen',
    reportBehavior: 'Berichte erstellen',
    answerRequestsBehavior: 'Fahrzeuganfragen beantworten',
};
@Pipe({
    name: 'behaviorToGermanName',
})
export class BehaviorToGermanNamePipe implements PipeTransform {
    transform(value: ExerciseSimulationBehaviorState): string {
        return behaviorToGermanNameDictionary[value.type];
    }
}
