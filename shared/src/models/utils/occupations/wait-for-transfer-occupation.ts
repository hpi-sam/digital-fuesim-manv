import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import type { Occupation } from './occupation';

export class WaitForTransferOccupation implements Occupation {
    @IsValue('waitForTransferOccupation')
    readonly type = 'waitForTransferOccupation';

    static readonly create = getCreate(this);
}
