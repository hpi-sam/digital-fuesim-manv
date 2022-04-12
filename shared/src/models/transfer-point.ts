import { Type } from 'class-transformer';
import { IsDefined, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, Position } from './utils';

export class TransferPoint {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => Position)
    public readonly position: Position;

    // TODO
    @IsDefined()
    public readonly reachableTransferPoints: {
        readonly [key: UUID]: {
            readonly duration: number;
        };
    };

    @IsString()
    public readonly internalName: string;

    @IsString()
    public readonly externalName: string;

    /**
     * @deprecated Use {@link create} instead
     */
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

    static readonly create = getCreate(this);
}
