import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    ReportableInformation,
    reportableInformationAllowedValues,
} from '../behaviors/utils';
import type { SimulationEvent } from './simulation-event';

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
