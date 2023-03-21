import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { uuid, UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { CanCaterFor, getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class MaterialCountRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID = uuid();

    @IsValue('materialCountRadiogram')
    readonly type = 'materialCountRadiogram';

    @IsUUID()
    readonly simulatedRegionId: UUID;

    @IsInt()
    @Min(0)
    readonly transmissionTime: number;

    @IsRadiogramStatus()
    @ValidateNested()
    readonly status: ExerciseRadiogramStatus;

    @ValidateNested()
    @Type(() => CanCaterFor)
    readonly materialForPatients: CanCaterFor;

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
        this.materialForPatients = {
            red: 0,
            yellow: 0,
            green: 0,
            logicalOperator: 'and',
        };
    }

    static readonly create = getCreate(this);
}
