import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import type { Occupation } from './occupation';

export class NoOccupation implements Occupation {
    @IsValue('noOccupation')
    readonly type = 'noOccupation';

    static readonly create = getCreate(this);
}
