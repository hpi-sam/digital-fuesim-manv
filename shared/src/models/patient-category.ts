import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { PatientTemplate } from './patient-template';
import { getCreate, ImageProperties } from './utils';
import { PatientStatusCode } from './utils/patient-status-code';

export class PatientCategory {
    @ValidateNested()
    @Type(() => PatientStatusCode)
    public readonly name: PatientStatusCode;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsArray()
    @ArrayNotEmpty()
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
