import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { PatientTemplate } from './patient-template';
import { getCreate, ImageProperties } from './utils';
import { PatientStatusCode } from './utils/patient-status-code';

export class PatientCategory {
    @IsString()
    public readonly name: PatientStatusCode;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PatientTemplate)
    public readonly patientTemplates: readonly PatientTemplate[] = [];

    /**
     * @deprecated Use {@link create} instead
     */
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
