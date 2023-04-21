import { IsValue } from '../../../utils/validators';
import { getCreate } from '../../utils/get-create';
import type { RadiogramStatus } from './radiogram-status';

export class RadiogramUnpublishedStatus implements RadiogramStatus {
    @IsValue('unpublishedRadiogramStatus')
    public readonly type = 'unpublishedRadiogramStatus';

    /**
     * @deprecated Use {@link create} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {}

    static readonly create = getCreate(this);
}
