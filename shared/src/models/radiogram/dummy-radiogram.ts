import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { uuid, UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class DummyRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID = uuid();

    @IsValue('dummyRadiogram')
    readonly type = 'dummyRadiogram';

    @IsUUID()
    readonly simulatedRegionId: UUID;

    @IsInt()
    @Min(0)
    readonly transmissionTime: number;

    @IsRadiogramStatus()
    @ValidateNested()
    readonly status: ExerciseRadiogramStatus;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        simulatedRegionId: UUID,
        transmissionTime: number,
        status: ExerciseRadiogramStatus
    ) {
        this.simulatedRegionId = simulatedRegionId;
        this.transmissionTime = transmissionTime;
        this.status = status;
    }

    static readonly create = getCreate(this);
}
