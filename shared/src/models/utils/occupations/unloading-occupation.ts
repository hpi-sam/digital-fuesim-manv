import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import type { Occupation } from './occupation';

export class UnloadingOccupation implements Occupation {
    @IsValue('unloadingOccupation')
    readonly type = 'unloadingOccupation';

    static readonly create = getCreate(this);
}
