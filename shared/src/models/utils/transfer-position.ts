import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IsValue } from '../../utils/validators';
import { getCreate } from './get-create';
import { Transfer } from './transfer';

export class TransferPosition {
    @IsValue('transfer')
    public readonly type = 'transfer';

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
