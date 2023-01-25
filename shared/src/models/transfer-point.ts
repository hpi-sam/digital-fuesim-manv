import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, UUIDSet, uuidValidationOptions } from '../utils';
import { IsReachableTransferPoints, IsUUIDSet } from '../utils/validators';
import { IsMetaPosition } from '../utils/validators/is-metaposition';
import type { ImageProperties, MapCoordinates } from './utils';
import { MapPosition, MetaPosition, getCreate } from './utils';

export class TransferPoint {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @IsMetaPosition()
    public readonly metaPosition: MetaPosition;

    @IsReachableTransferPoints()
    public readonly reachableTransferPoints: ReachableTransferPoints;

    @IsUUIDSet()
    public readonly reachableHospitals: UUIDSet = {};

    @IsString()
    public readonly internalName: string;

    @IsString()
    public readonly externalName: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        position: MapCoordinates,
        reachableTransferPoints: ReachableTransferPoints,
        reachableHospitals: UUIDSet,
        internalName: string,
        externalName: string
    ) {
        this.metaPosition = MapPosition.create(position);
        this.reachableTransferPoints = reachableTransferPoints;
        this.reachableHospitals = reachableHospitals;
        this.internalName = internalName;
        this.externalName = externalName;
    }

    static readonly create = getCreate(this);

    static image: ImageProperties = {
        url: 'assets/transfer-point.svg',
        height: 400,
        aspectRatio: 134 / 102,
    };

    public static getFullName(transferPoint: TransferPoint): string {
        return `${transferPoint.externalName} (${transferPoint.internalName})`;
    }
}

export interface ReachableTransferPoints {
    readonly [connectTransferPointId: UUID]: {
        /**
         * The time in ms it takes to get from this transfer point to the other one.
         */
        readonly duration: number;
    };
}
