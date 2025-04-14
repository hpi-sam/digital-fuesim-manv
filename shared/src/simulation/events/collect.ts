import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsLiteralUnion, IsValue } from '../../utils/validators/index.js';
import type { ReportableInformation } from '../behaviors/utils.js';
import { reportableInformationAllowedValues } from '../behaviors/utils.js';
import type { SimulationEvent } from './simulation-event.js';

export class CollectInformationEvent implements SimulationEvent {
    @IsValue('collectInformationEvent')
    readonly type = 'collectInformationEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly generateReportActivityId: UUID;

    @IsLiteralUnion(reportableInformationAllowedValues)
    readonly informationType: ReportableInformation;
    /**
     * @deprecated Use {@link create} instead.
     */
    constructor(
        generateReportActivityId: UUID,
        informationType: ReportableInformation
    ) {
        this.generateReportActivityId = generateReportActivityId;
        this.informationType = informationType;
    }

    static readonly create = getCreate(this);
}
