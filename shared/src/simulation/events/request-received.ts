import { IsString } from 'class-validator';
import { getCreate } from '../../models/utils';
import { IsValue } from '../../utils/validators';
import { ResourceDescription } from '../../models/utils/resource-description';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import type { SimulationEvent } from './simulation-event';

export class RequestReceivedEvent implements SimulationEvent {
    @IsValue('requestReceivedEvent')
    readonly type = 'requestReceivedEvent';

    @IsResourceDescription()
    readonly availableVehicles: ResourceDescription;

    @IsString()
    readonly key: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(availableVehicles: ResourceDescription, key: string) {
        this.availableVehicles = availableVehicles;
        this.key = key;
    }

    static readonly create = getCreate(this);
}
