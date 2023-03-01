import { IsNumber, Min } from 'class-validator';
import type { AllowedValues } from '../../utils/validators';
import { IsLiteralUnion } from '../../utils/validators';
import { getCreate } from './get-create';

type LogicalOperator = 'and' | 'or';
const logicalOperatorAllowedValues: AllowedValues<LogicalOperator> = {
    and: true,
    or: true,
};

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

    @IsLiteralUnion(logicalOperatorAllowedValues)
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
