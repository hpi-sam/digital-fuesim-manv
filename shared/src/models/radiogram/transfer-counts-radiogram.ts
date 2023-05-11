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

type Scope = 'singleRegion' | 'transportManagement';

type TransferablePatientStatus = Exclude<
    PatientStatus,
    'black' | 'blue' | 'white'
>;

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
    readonly transferredPatientsCounts: ResourceDescription<TransferablePatientStatus> =
        { red: 0, yellow: 0, green: 0 };

    @IsResourceDescription()
    readonly remainingPatientsCounts: ResourceDescription<TransferablePatientStatus> =
        { red: 0, yellow: 0, green: 0 };

    /**
     * Defines the scope of the counts reported with this radiogram.
     * * `singleRegion`: The patient counts refer only to the simulated region that sent the radiogram
     * * `transportManagement`: The patient counts refer to all simulated regions
     *   that are managed by the transport management behavior of the simulated region that sent the radiogram
     */
    @IsLiteralUnion({ singleRegion: true, transportManagement: true })
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
