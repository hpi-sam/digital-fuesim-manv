import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import {
    TreatmentProgress,
    treatmentProgressAllowedValues,
} from '../../simulation';
import { uuid, UUID } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class TreatmentStatusRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID = uuid();

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
        simulatedRegionId: UUID,
        transmissionTime: number,
        status: ExerciseRadiogramStatus
    ) {
        this.simulatedRegionId = simulatedRegionId;
        this.transmissionTime = transmissionTime;
        this.status = status;
        this.treatmentStatus = 'unknown';
    }

    static readonly create = getCreate(this);
}
