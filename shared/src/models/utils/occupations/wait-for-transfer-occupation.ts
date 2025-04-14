import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
import type { Occupation } from './occupation.js';

export class WaitForTransferOccupation implements Occupation {
    @IsValue('waitForTransferOccupation')
    readonly type = 'waitForTransferOccupation';

    static readonly create = getCreate(this);
}
