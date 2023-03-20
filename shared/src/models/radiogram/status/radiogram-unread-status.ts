import { IsValue } from '../../../utils/validators';
import { getCreate } from '../../utils';
import type { RadiogramStatus } from './radiogram-status';

export class RadiogramUnreadStatus implements RadiogramStatus {
    @IsValue('unreadRadiogramStatus')
    public readonly type = 'unreadRadiogramStatus';

    /**
     * @deprecated Use {@link create} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {}

    static readonly create = getCreate(this);
}
