import { Type } from 'class-transformer';
import { Allow, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { Position } from './utils';

export class TransferPoint {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    @Type(() => Position)
    public position: Position;

    // TODO
    @Allow()
    public reachableTransferPoints: {
        [key: UUID]: {
            duration: number;
        };
    };

    @IsString()
    public internalName: string;

    @IsString()
    public externalName: string;

    constructor(
        position: Position,
        reachableTransferPoints: {
            [key: UUID]: {
                duration: number;
            };
        },
        internalName: string,
        externalName: string
    ) {
        this.position = position;
        this.reachableTransferPoints = reachableTransferPoints;
        this.internalName = internalName;
        this.externalName = externalName;
    }
}
