import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { CanCaterFor, getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class MaterialCountRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID;

    @IsValue('materialCountRadiogram')
    readonly type = 'materialCountRadiogram';

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
    readonly informationAvailable!: boolean;

    @ValidateNested()
    @Type(() => CanCaterFor)
    readonly materialForPatients: CanCaterFor;

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
        this.materialForPatients = {
            red: 0,
            yellow: 0,
            green: 0,
            logicalOperator: 'and',
        };
    }

    static readonly create = getCreate(this);
}
