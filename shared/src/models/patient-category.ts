import { Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested } from 'class-validator';
import type { PatientTemplate } from './patient-template';
import { getCreate, ImageProperties } from './utils';
import { PatientStatusCode } from './utils/patient-status-code';

export class PatientCategory {
    @IsString()
    public readonly name: PatientStatusCode;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsDefined()
    public readonly patientTemplates: readonly PatientTemplate[] = [];

    constructor(
        name: string,
        image: ImageProperties,
        patientTemplates: PatientTemplate[]
    ) {
        this.name = PatientStatusCode.create(name);
        this.image = image;
        this.patientTemplates = patientTemplates;
    }

    static readonly create = getCreate(this);
}
