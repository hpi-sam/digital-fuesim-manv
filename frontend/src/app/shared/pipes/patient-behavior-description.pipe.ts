import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { BehaviourCode } from 'digital-fuesim-manv-shared';

const behaviorDescriptionMap: { [Key in BehaviourCode]: string } = {
    A: 'Stabil',
    B: 'Lebensrettende Maßnahme erforderlich',
    C: 'Transportpriorität',
    D: 'Komplikation',
    E: 'Verstorben',
};

@Pipe({
    name: 'patientBehaviorDescription',
})
export class PatientBehaviorDescriptionPipe implements PipeTransform {
    transform(value: BehaviourCode): string {
        return behaviorDescriptionMap[value];
    }
}
