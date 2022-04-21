import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, ImageProperties } from './utils';

export class MapImageTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly name: string;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(name: string, image: ImageProperties) {
        this.name = name;
        this.image = image;
    }

    static readonly create = getCreate(this);
}
