import { Type } from 'class-transformer';
import { IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';
import { maxTreatmentRange } from '../state-helpers/max-treatment-range';
import {
    CanCaterFor,
    getCreate,
    ImageProperties,
    PersonnelType,
} from './utils';

// TODO: These are not (yet) saved in the state -> Decide whether they should and if not move this file from the models folder away
export class PersonnelTemplate {
    @IsString()
    public readonly personnelType: PersonnelType;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly canCaterFor: CanCaterFor;

    /**
     * Patients in this range are preferred over patients farther away (even if they are less injured).
     * Guaranteed to be <= {@link maxTreatmentRange}.
     */
    @IsNumber()
    @Min(0)
    @Max(maxTreatmentRange)
    public readonly overrideTreatmentRange: number;

    /**
     * Only patients in this range around the personnel's position can be treated.
     * Guaranteed to be <= {@link maxTreatmentRange}.
     */
    @IsNumber()
    @Min(0)
    @Max(maxTreatmentRange)
    public readonly treatmentRange: number;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        personnelType: PersonnelType,
        image: ImageProperties,
        canCaterFor: CanCaterFor,
        overrideTreatmentRange: number,
        treatmentRange: number
    ) {
        this.personnelType = personnelType;
        this.image = image;
        this.canCaterFor = canCaterFor;
        this.overrideTreatmentRange = overrideTreatmentRange;
        this.treatmentRange = treatmentRange;
    }

    static readonly create = getCreate(this);
}
