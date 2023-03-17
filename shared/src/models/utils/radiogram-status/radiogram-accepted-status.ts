import { IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../../utils';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';

export class RadiogramAcceptedStatus {
    @IsValue('accepted')
    public readonly type = 'accepted';

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
