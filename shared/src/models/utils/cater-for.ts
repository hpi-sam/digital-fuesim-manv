import { IsNumber } from 'class-validator';

export class CanCaterFor {
    @IsNumber()
    public red: number;

    @IsNumber()
    public yellow: number;

    @IsNumber()
    public green: number;

    // TODO
    public logicalOperator: 'and' | 'or';

    public constructor(
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
}
