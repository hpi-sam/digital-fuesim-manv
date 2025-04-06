import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
import type { Occupation } from './occupation.js';

export class NoOccupation implements Occupation {
    @IsValue('noOccupation')
    readonly type = 'noOccupation';

    static readonly create = getCreate(this);
}
