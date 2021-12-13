import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, UUIDValidationOptions } from '../utils';
import { Position, Size } from './utils';

export class Viewport {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    public topLeft: Position;

    @ValidateNested()
    public size: Size;

    @IsString()
    public name: string;

    constructor(topLeft: Position, size: Size, name: string) {
        this.topLeft = topLeft;
        this.size = size;
        this.name = name;
    }
}
