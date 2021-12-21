import { IsString, IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';
import type { Position, Size } from './utils';

export class Viewport {
    @IsUUID(4, uuidValidationOptions)
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
