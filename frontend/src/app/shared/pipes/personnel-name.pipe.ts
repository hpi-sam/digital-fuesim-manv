import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { PersonnelType } from 'digital-fuesim-manv-shared';
import { personnelTypeNames } from 'digital-fuesim-manv-shared';

@Pipe({
    name: 'personnelName',
    standalone: false,
})
export class PersonnelNamePipe implements PipeTransform {
    transform(personnelType: PersonnelType | undefined): string {
        if (!personnelType) return '';

        return personnelTypeNames[personnelType];
    }
}
