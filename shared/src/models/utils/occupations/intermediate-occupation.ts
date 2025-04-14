import { IsInt, Min } from 'class-validator';
import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
import type { Occupation } from './occupation.js';

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
