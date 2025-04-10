import { getCreate } from '../../models/utils/get-create.js';
import { IsLiteralUnion, IsValue } from '../../utils/validators/index.js';
import type { ReportableInformation } from '../behaviors/utils.js';
import { reportableInformationAllowedValues } from '../behaviors/utils.js';
import type { SimulationEvent } from './simulation-event.js';

export class StartCollectingInformationEvent implements SimulationEvent {
    @IsValue('startCollectingInformationEvent')
    readonly type = 'startCollectingInformationEvent';

    @IsLiteralUnion(reportableInformationAllowedValues)
    readonly informationType: ReportableInformation;
    /**
     * @deprecated Use {@link create} instead.
     */
    constructor(informationType: ReportableInformation) {
        this.informationType = informationType;
    }

    static readonly create = getCreate(this);
}
