import { IsIn, IsNumber, Min } from 'class-validator';
import { getCreate } from './get-create';

const logicalOperatorOptions = ['and', 'or'] as const;
type LogicalOperator = typeof logicalOperatorOptions[number];

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
     * how many extra {@link yellow} and {@link green} patients can the catering treat
     * to the number already written in the {@link red} value
     */
    @IsNumber()
    @Min(0)
    public readonly yellow: number;

    /**
     * if {@link logicalOperator}  `=== 'and'` it is cumulative,
     * how many {@link green} patients can the catering treat
     * to the number already written in the {@link yellow} and {@link red} value
     */
    @IsNumber()
    @Min(0)
    public readonly green: number;

    @IsIn(logicalOperatorOptions)
    public readonly logicalOperator: LogicalOperator;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        red: number,
        yellow: number,
        green: number,
        logicalOperator: LogicalOperator
    ) {
        this.red = red;
        this.yellow = yellow;
        this.green = green;
        this.logicalOperator = logicalOperator;
    }

    static readonly create = getCreate(this);
}
