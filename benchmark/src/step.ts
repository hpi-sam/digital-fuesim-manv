export abstract class Step<
    State extends {
        [StepName: string]: any | undefined;
    },
    Name extends keyof State = keyof State,
    Value extends State[Name] = State[Name]
> {
    constructor(
        public readonly name: Name,
        /**
         * Whether a column with the values of this step should be added to the printed table at the end
         */
        private readonly print: boolean
    ) {}

    protected abstract runStep(state: State): NonNullable<Value>;

    /**
     * This function is expected to modify the state.
     * It can throw an error to stop all steps that come after it.
     * It can print out information to the console.
     */
    public run(state: State) {
        state[this.name] = this.runStep(state);
    }

    protected abstract formatValue(value: NonNullable<Value>): any;

    public getColumnToPrint(state: State): {
        [columnName: string]: any;
    } {
        return this.print
            ? { [this.name]: this.formatValue(state[this.name]) }
            : {};
    }
}
