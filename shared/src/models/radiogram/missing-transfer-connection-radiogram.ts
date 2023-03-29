import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class MissingTransferConnectionRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID;

    @IsValue('missingTransferConnectionRadiogram')
    readonly type = 'missingTransferConnectionRadiogram';

    @IsUUID()
    readonly simulatedRegionId: UUID;

    /**
     * @deprecated use the helpers from {@link radiogram-helpers.ts}
     * or {@link radiogram-helpers-mutable.ts} instead
     */
    @IsRadiogramStatus()
    @ValidateNested()
    readonly status: ExerciseRadiogramStatus;

    @IsBoolean()
    readonly informationAvailable: boolean = false;

    @IsUUID()
    readonly targetTransferPointID: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        simulatedRegionId: UUID,
        status: ExerciseRadiogramStatus
    ) {
        this.id = id;
        this.simulatedRegionId = simulatedRegionId;
        this.status = status;
        this.targetTransferPointID = '';
    }

    static readonly create = getCreate(this);
}
