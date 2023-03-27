import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsPatientCount } from '../../utils/validators/is-patient-count';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import type { PatientStatus } from '../utils';
import { getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export type PatientCount = { [key in PatientStatus]: number };

export class PatientCountRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID;

    @IsValue('patientCountRadiogram')
    readonly type = 'patientCountRadiogram';

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

    @IsPatientCount()
    readonly patientCount: PatientCount;

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
        this.patientCount = {
            red: 0,
            yellow: 0,
            green: 0,
            blue: 0,
            black: 0,
            white: 0,
        };
    }

    static readonly create = getCreate(this);
}
