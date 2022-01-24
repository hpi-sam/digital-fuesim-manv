import { IsIn, IsNumber } from 'class-validator';
import { getCreate } from './get-create';

const logicalOperatorOptions = ['and', 'or'] as const;
type LogicalOperator = typeof logicalOperatorOptions[number];

export class CanCaterFor {
    @IsNumber()
    public readonly red: number;

    @IsNumber()
    public readonly yellow: number;

    @IsNumber()
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
