import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import type { PatientStatus } from '../utils';
import { getCreate } from '../utils';
import { ResourceDescription } from '../utils/resource-description';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';
import { Scope, scopeAllowedValues } from './utils/transfer-progress-scope';

export class TransferCountsRadiogram implements Radiogram {
    @IsUUID(4, uuidValidationOptions)
    readonly id: UUID;

    @IsValue('transferCountsRadiogram')
    readonly type = 'transferCountsRadiogram';

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

    @IsResourceDescription()
    readonly transferredPatientsCounts: ResourceDescription<PatientStatus> = {
        red: 0,
        yellow: 0,
        green: 0,
        blue: 0,
        black: 0,
        white: 0,
    };

    @IsResourceDescription()
    readonly remainingPatientsCounts: ResourceDescription<PatientStatus> = {
        red: 0,
        yellow: 0,
        green: 0,
        blue: 0,
        black: 0,
        white: 0,
    };

    /**
     * Defines the scope of the counts reported with this radiogram.
     * * `singleRegion`: The patient counts refer only to the simulated region that sent the radiogram
     * * `transportManagement`: The patient counts refer to all simulated regions
     *   that are managed by the transport management behavior of the simulated region that sent the radiogram
     */
    @IsLiteralUnion(scopeAllowedValues)
    readonly scope: Scope = 'singleRegion';

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
    }

    static readonly create = getCreate(this);
}
