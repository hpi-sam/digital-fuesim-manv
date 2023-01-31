import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import { Transfer } from '../transfer';
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isInTransfer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isNotInTransfer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentTransferOf,
} from './position-helpers';

export class TransferPosition {
    /**
     * @deprecated Use {@link isInTransfer } or {@link isNotInTransfer} instead
     */
    @IsValue('transfer')
    public readonly type = 'transfer';

    /**
     * @deprecated Use {@link currentTransferOf } instead
     */
    @Type(() => Transfer)
    @ValidateNested()
    public readonly transfer: Transfer;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(transfer: Transfer) {
        this.transfer = transfer;
    }

    static readonly create = getCreate(this);
}
