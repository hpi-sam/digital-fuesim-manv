import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { TreatmentProgress } from 'digital-fuesim-manv-shared';
const treatmentProgressToGermanNameDictionary: {
    [Key in TreatmentProgress]: string;
} = {
    counted: 'Vorsichten',
    secured: 'Erstversorgung sichergestellt',
    triaged: 'Behandeln, Personal fehlt',
    unknown: 'Erkunden',
};

@Pipe({
    name: 'treatmentProgressToGermanName',
})
export class TreatmentProgressToGermanNamePipe implements PipeTransform {
    transform(value: TreatmentProgress): string {
        return treatmentProgressToGermanNameDictionary[value];
    }
}
