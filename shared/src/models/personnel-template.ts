import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
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

    @IsBoolean()
    public readonly auraMode: boolean;

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
        auraMode: boolean
    ) {
        this.personnelType = personnelType;
        this.image = image;
        this.canCaterFor = canCaterFor;
        this.auraMode = auraMode;
    }

    static readonly create = getCreate(this);
}
