import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { uuid, UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsPersonnelCount } from '../../utils/validators/is-personnel-count';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import type { PersonnelType } from '../utils';
import { getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export type PersonnelCount = { [key in PersonnelType]: number };

export class PersonnelCountRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID = uuid();

    @IsValue('personnelCountRadiogram')
    readonly type = 'personnelCountRadiogram';

    @IsUUID()
    readonly simulatedRegionId: UUID;

    @IsInt()
    @Min(0)
    readonly transmissionTime: number;

    @IsRadiogramStatus()
    @ValidateNested()
    readonly status: ExerciseRadiogramStatus;

    @IsPersonnelCount()
    readonly personnelCount: PersonnelCount;

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
        this.personnelCount = {
            gf: 0,
            notarzt: 0,
            notSan: 0,
            rettSan: 0,
            san: 0,
        };
    }

    static readonly create = getCreate(this);
}
