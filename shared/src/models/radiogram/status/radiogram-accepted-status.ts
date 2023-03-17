import { IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../../utils';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../../utils/get-create';
import type { RadiogramStatus } from './radiogram-status';

export class RadiogramAcceptedStatus implements RadiogramStatus {
    @IsValue('acceptedRadiogramStatus')
    public readonly type = 'acceptedRadiogramStatus';

    @IsUUID(4, uuidValidationOptions)
    public readonly clientId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(clientId: string) {
        this.clientId = clientId;
    }

    static readonly create = getCreate(this);
}
