import { IsNumber, IsString, Min } from 'class-validator';
import { getCreate } from './get-create';

export class CanCaterFor {
    /**
     * if {@link logicalOperator}  `=== 'and'` it is cumulative,
     * how many red patients can the catering treat
     * also affects the number of possible {@link yellow} and {@link green} patients
     * that can be treated.
     */
    @IsNumber()
    @Min(0)
    public readonly red: number;

    /**
     * if {@link logicalOperator}  `=== 'and'` it is cumulative,
     * how many yellow patients can the catering treat
     * to the number already written in the {@link red} value
     */
    @IsNumber()
    @Min(0)
    public readonly yellow: number;

    /**
     * if {@link logicalOperator}  `=== 'and'` it is cumulative,
     * how many green patients can the catering treat
     * to the number already written in the {@link yellow} and {@link red} value
     */
    @IsNumber()
    @Min(0)
    public readonly green: number;

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
