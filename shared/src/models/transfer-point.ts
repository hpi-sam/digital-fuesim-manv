import { Type } from 'class-transformer';
import { IsDefined, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { ImageProperties } from './utils';
import { getCreate, Position } from './utils';

export class TransferPoint {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => Position)
    public readonly position: Position;

    // TODO
    @IsDefined()
    public readonly reachableTransferPoints: ReachableTransferPoints;

    @IsString()
    public readonly internalName: string;

    @IsString()
    public readonly externalName: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        position: Position,
        reachableTransferPoints: ReachableTransferPoints,
        internalName: string,
        externalName: string
    ) {
        this.position = position;
        this.reachableTransferPoints = reachableTransferPoints;
        this.internalName = internalName;
        this.externalName = externalName;
    }

    static readonly create = getCreate(this);

    static image: ImageProperties = {
        url: 'assets/transfer-point.svg',
        height: 400,
        aspectRatio: 134 / 102,
    };
}

// TODO: Add validation
interface ReachableTransferPoints {
    readonly [connectTransferPointId: UUID]: {
        /**
         * The time in ms it takes to get from this transfer point to the other one.
         */
        readonly duration: number;
    };
}
