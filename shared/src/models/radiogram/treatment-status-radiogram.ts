import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import {
    TreatmentProgress,
    treatmentProgressAllowedValues,
} from '../../simulation/utils/treatment';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { getCreate } from '../utils/get-create';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class TreatmentStatusRadiogram implements Radiogram {
    @IsUUID(4, uuidValidationOptions)
    readonly id: UUID;

    @IsValue('treatmentStatusRadiogram')
    readonly type = 'treatmentStatusRadiogram';

    @IsUUID(4, uuidValidationOptions)
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

    @IsLiteralUnion(treatmentProgressAllowedValues)
    readonly treatmentStatus: TreatmentProgress;

    @IsBoolean()
    readonly treatmentStatusChanged: boolean = false;

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
        this.treatmentStatus = 'noTreatment';
    }

    static readonly create = getCreate(this);
}
