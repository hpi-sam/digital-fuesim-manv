import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, UUIDValidationOptions } from '../utils';
import { Position } from './utils';

export class TransferPoint {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    public position: Position;

    // TODO
    public reachableTransferPoints: Record<
        UUID,
        {
            duration: number;
        }
    >;

    @IsString()
    public internalName: string;

    @IsString()
    public externalName: string;

    constructor(
        position: Position,
        reachableTransferPoints: Record<
            UUID,
            {
                duration: number;
            }
        >,
        internalName: string,
        externalName: string
    ) {
        this.position = position;
        this.reachableTransferPoints = reachableTransferPoints;
        this.internalName = internalName;
        this.externalName = externalName;
    }
}
