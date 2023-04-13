import { IsInt, Min } from 'class-validator';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../../utils/get-create';
import type { RadiogramStatus } from './radiogram-status';

export class RadiogramUnreadStatus implements RadiogramStatus {
    @IsValue('unreadRadiogramStatus')
    public readonly type = 'unreadRadiogramStatus';

    @IsInt()
    @Min(0)
    public readonly publishTime: number;

    /**
     * @deprecated Use {@link create} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor(publishTime: number) {
        this.publishTime = publishTime;
    }

    static readonly create = getCreate(this);
}
