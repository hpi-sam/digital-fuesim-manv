import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
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

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        personnelType: PersonnelType,
        image: ImageProperties,
        canCaterFor: CanCaterFor
    ) {
        this.personnelType = personnelType;
        this.image = image;
        this.canCaterFor = canCaterFor;
    }

    static readonly create = getCreate(this);
}
