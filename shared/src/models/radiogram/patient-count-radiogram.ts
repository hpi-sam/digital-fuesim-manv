import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { uuid, UUID } from '../../utils';
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
    readonly id: UUID = uuid();

    @IsValue('patientCountRadiogram')
    readonly type = 'patientCountRadiogram';

    @IsUUID()
    readonly simulatedRegionId: UUID;

    @IsInt()
    @Min(0)
    readonly transmissionTime: number;

    @IsRadiogramStatus()
    @ValidateNested()
    readonly status: ExerciseRadiogramStatus;

    @IsPatientCount()
    readonly patientCount: PatientCount;

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
