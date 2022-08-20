import { Type } from 'class-transformer';
import { IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import {
    CanCaterFor,
    ImageProperties,
    getCreate,
    PersonnelType,
} from './utils';

export class PersonnelTemplate {
    @IsString()
    public readonly personnelType: PersonnelType;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly canCaterFor: CanCaterFor;

    @IsNumber()
    @Min(0)
    public readonly specificThreshold: number;

    @IsNumber()
    @Min(0)
    public readonly generalThreshold: number;

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
        specificThreshold: number,
        generalThreshold: number
    ) {
        this.personnelType = personnelType;
        this.image = image;
        this.canCaterFor = canCaterFor;
        this.specificThreshold = specificThreshold;
        this.generalThreshold = generalThreshold;
    }

    static readonly create = getCreate(this);
}
