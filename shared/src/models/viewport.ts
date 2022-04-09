import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { Position, Size } from './utils';

export class Viewport {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    @Type(() => Position)
    public topLeft: Position;

    @ValidateNested()
    @Type(() => Size)
    public size: Size;

    @IsString()
    public name: string;

    private constructor(topLeft: Position, size: Size, name: string) {
        this.topLeft = topLeft;
        this.size = size;
        this.name = name;
    }

    static create(topLeft: Position, size: Size, name: string) {
        return { ...new Viewport(topLeft, size, name) };
    }
}
