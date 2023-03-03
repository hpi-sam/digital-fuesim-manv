import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { IsPosition } from '../utils/validators/is-position';
import { IsMultiTypedIdMap, IsValue } from '../utils/validators';
import type { ExerciseSimulationEvent } from '../simulation';
import { simulationEventTypeOptions } from '../simulation';
import type { ExerciseSimulationActivityState } from '../simulation/activities';
import { getSimulationActivityConstructor } from '../simulation/activities';
import type { ExerciseSimulationBehaviorState } from '../simulation/behaviors';
import { simulationBehaviorTypeOptions } from '../simulation/behaviors';
import { getCreate, MapPosition, Position, Size } from './utils';
import type { ImageProperties, MapCoordinates } from './utils';

export class SimulatedRegion {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('simulatedRegion' as const)
    public readonly type = 'simulatedRegion';

    /**
     * top-left position
     *
     * @deprecated Do not access directly, use helper methods from models/utils/position/position-helpers(-mutable) instead.
     */
    @ValidateNested()
    @IsPosition()
    public readonly position: Position;

    @ValidateNested()
    @Type(() => Size)
    public readonly size: Size;

    @IsString()
    public readonly name: string;

    /**
     * @param position top-left position
     * @deprecated Use {@link create} instead
     */
    constructor(position: MapCoordinates, size: Size, name: string) {
        this.position = MapPosition.create(position);
        this.size = size;
        this.name = name;
    }

    @ValidateIf(
        (simulatedRegion, transferPointId) => transferPointId !== undefined
    )
    @IsUUID()
    public readonly transferPointId: UUID | undefined;

    @Type(...simulationEventTypeOptions)
    @ValidateNested()
    public readonly inEvents: readonly ExerciseSimulationEvent[] = [];

    @Type(...simulationBehaviorTypeOptions)
    @ValidateNested()
    public readonly behaviors: readonly ExerciseSimulationBehaviorState[] = [];

    @IsMultiTypedIdMap(getSimulationActivityConstructor)
    @ValidateNested()
    public readonly activities: {
        readonly [stateId: UUID]: ExerciseSimulationActivityState;
    } = {};

    static readonly create = getCreate(this);

    static image: ImageProperties = {
        url: 'assets/simulated-region.svg',
        height: 1800,
        aspectRatio: 1600 / 900,
    };
}
