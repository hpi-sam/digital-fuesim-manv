import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';

export class RadiogramDoneStatus {
    @IsValue('done')
    public readonly type = 'done';

    /**
     * @deprecated Use {@link create} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {}

    static readonly create = getCreate(this);
}
