import { IsInt, Min } from 'class-validator';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import type { Occupation } from './occupation';

export class IntermediateOccupation implements Occupation {
    @IsValue('intermediateOccupation')
    readonly type = 'intermediateOccupation';

    @IsInt()
    @Min(0)
    readonly unoccupiedUntil: number;

    /**
     * @deprecated Use static `create` method instead.
     */
    constructor(unoccupiedUntil: number) {
        this.unoccupiedUntil = unoccupiedUntil;
    }

    static readonly create = getCreate(this);
}
