import { IsInt, IsUUID, Min } from 'class-validator';
import { IsValue } from '../../utils/validators';
import { getCreate } from '../../models/utils/get-create';
import { UUID, uuidValidationOptions } from '../../utils';

export class PatientsTransportPromise {
    @IsValue('patientsTransportPromise')
    readonly type = 'patientsTransportPromise';

    @IsInt()
    @Min(0)
    readonly promisedTime: number;

    @IsInt()
    @Min(0)
    readonly patientCount: number;

    @IsUUID(4, uuidValidationOptions)
    readonly targetSimulatedRegionId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        promisedTime: number,
        patientCount: number,
        targetSimulatedRegionId: UUID
    ) {
        this.promisedTime = promisedTime;
        this.patientCount = patientCount;
        this.targetSimulatedRegionId = targetSimulatedRegionId;
    }

    static readonly create = getCreate(this);
}
