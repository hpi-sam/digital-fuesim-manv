import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import {
    TreatmentProgress,
    treatmentProgressAllowedValues,
} from '../../simulation';
import { UUID } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class TreatmentStatusRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID;

    @IsValue('treatmentStatusRadiogram')
    readonly type = 'treatmentStatusRadiogram';

    @IsUUID()
    readonly simulatedRegionId: UUID;

    @IsInt()
    @Min(0)
    readonly transmissionTime: number;

    @IsRadiogramStatus()
    @ValidateNested()
    readonly status: ExerciseRadiogramStatus;

    @IsLiteralUnion(treatmentProgressAllowedValues)
    readonly treatmentStatus: TreatmentProgress;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        simulatedRegionId: UUID,
        transmissionTime: number,
        status: ExerciseRadiogramStatus
    ) {
        this.id = id;
        this.simulatedRegionId = simulatedRegionId;
        this.transmissionTime = transmissionTime;
        this.status = status;
        this.treatmentStatus = 'unknown';
    }

    static readonly create = getCreate(this);
}
