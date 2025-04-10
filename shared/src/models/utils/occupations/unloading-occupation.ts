import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
import type { Occupation } from './occupation.js';

export class UnloadingOccupation implements Occupation {
    @IsValue('unloadingOccupation')
    readonly type = 'unloadingOccupation';

    static readonly create = getCreate(this);
}
