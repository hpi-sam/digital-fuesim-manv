import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { IsValue } from '../utils/validators/index.js';
import { PatientTemplate } from './patient-template.js';
import { getCreate, ImageProperties } from './utils/index.js';
import { PatientStatusCode } from './utils/patient-status-code.js';

export class PatientCategory {
    @IsValue('patientCategory' as const)
    public readonly type = 'patientCategory';

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
