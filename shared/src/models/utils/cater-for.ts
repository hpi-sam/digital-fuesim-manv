import { IsNumber, IsString } from 'class-validator';
import { getCreate } from './get-create';

export class CanCaterFor {
    @IsNumber()
    public readonly red: number;

    @IsNumber()
    public readonly yellow: number;

    @IsNumber()
    public readonly green: number;

    // TODO
    @IsString()
    public readonly logicalOperator: 'and' | 'or';

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        red: number,
        yellow: number,
        green: number,
        logicalOperator: 'and' | 'or'
    ) {
        this.red = red;
        this.yellow = yellow;
        this.green = green;
        this.logicalOperator = logicalOperator;
    }

    static readonly create = getCreate(this);
}
