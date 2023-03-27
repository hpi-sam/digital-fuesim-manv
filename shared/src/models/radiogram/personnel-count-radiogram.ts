import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from '../../utils';
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
    readonly id: UUID;

    @IsValue('personnelCountRadiogram')
    readonly type = 'personnelCountRadiogram';

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

    @IsPersonnelCount()
    readonly personnelCount: PersonnelCount;

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
