import { IsNumber, Min } from 'class-validator';
import { getCreate } from './get-create';

export class CanCaterFor {
    /**
     *
     */
    @IsNumber()
    @Min(0)
    public readonly capacity: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(capacity: number) {
        this.capacity = capacity;
    }

    static readonly create = getCreate(this);
}
