import { IsNumber, IsString } from 'class-validator';

export class CanCaterFor {
    @IsNumber()
    public red: number;

    @IsNumber()
    public yellow: number;

    @IsNumber()
    public green: number;

    // TODO
    @IsString()
    public logicalOperator: 'and' | 'or';

    private constructor(
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

    static create(
        red: number,
        yellow: number,
        green: number,
        logicalOperator: 'and' | 'or'
    ) {
        return { ...new CanCaterFor(red, yellow, green, logicalOperator) };
    }
}
