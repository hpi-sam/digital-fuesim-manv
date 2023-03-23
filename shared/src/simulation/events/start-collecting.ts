import { getCreate } from '../../models/utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    ReportableInformation,
    reportableInformationAllowedValues,
} from '../behaviors/utils';
import type { SimulationEvent } from './simulation-event';

export class StartCollectingInformationEvent implements SimulationEvent {
    @IsValue('startCollectingInformationEvent')
    readonly type = 'startCollectingInformationEvent';

    @IsLiteralUnion(reportableInformationAllowedValues)
    readonly informationType!: ReportableInformation;
    /**
     * @deprecated Use {@link create} instead.
     */
    constructor(informationType: ReportableInformation) {
        this.informationType = informationType;
    }

    static readonly create = getCreate(this);
}
