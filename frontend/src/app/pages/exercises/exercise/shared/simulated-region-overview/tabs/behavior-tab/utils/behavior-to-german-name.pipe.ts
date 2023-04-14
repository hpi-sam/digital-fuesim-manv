import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ExerciseSimulationBehaviorType } from 'digital-fuesim-manv-shared';

const behaviorTypeToGermanNameDictionary: {
    [Key in ExerciseSimulationBehaviorType]: string;
} = {
    assignLeaderBehavior: 'Führung zuweisen',
    treatPatientsBehavior: 'Patienten behandeln',
    unloadArrivingVehiclesBehavior: 'Fahrzeuge entladen',
    reportBehavior: 'Berichte erstellen',
    providePersonnelBehavior: 'Personal nachfordern',
    answerRequestsBehavior: 'Fahrzeuganfragen beantworten',
};
@Pipe({
    name: 'behaviorTypeToGermanName',
})
export class BehaviorTypeToGermanNamePipe implements PipeTransform {
    transform(value: ExerciseSimulationBehaviorType): string {
        return behaviorTypeToGermanNameDictionary[value];
    }
}
