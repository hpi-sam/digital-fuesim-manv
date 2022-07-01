import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNumber,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { CanCaterFor, ImageProperties, getCreate } from './utils';
import { MaterialType } from './utils/material-type';

export class MaterialTemplate {
    @IsString()
    public readonly materialType: MaterialType;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly canCaterFor: CanCaterFor;

    @IsNumber()
    @Min(0)
    public readonly specificThreshold: number;

    @IsNumber()
    @Min(0)
    public readonly generalThreshold: number;

    @IsBoolean()
    public readonly auraMode: boolean;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        materialType: MaterialType,
        image: ImageProperties,
        canCaterFor: CanCaterFor,
        specificThreshold: number,
        generalThreshold: number,
        auraMode: boolean
    ) {
        this.materialType = materialType;
        this.image = image;
        this.canCaterFor = canCaterFor;
        this.specificThreshold = specificThreshold;
        this.generalThreshold = generalThreshold;
        this.auraMode = auraMode;
    }

    static readonly create = getCreate(this);
}
