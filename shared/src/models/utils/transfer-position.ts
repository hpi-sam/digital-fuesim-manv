import { getCreate } from './get-create';
import type { Transfer } from './transfer';

export class MapPosition {
    public readonly type: 'Transfer';

    public readonly transfer: Transfer;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(transfer: Transfer) {
        this.type = 'Transfer';
        this.transfer = transfer;
    }

    static readonly create = getCreate(this);
}
