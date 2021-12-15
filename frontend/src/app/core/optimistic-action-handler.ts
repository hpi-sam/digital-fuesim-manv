/**
 * This class handels optimistic actions on a state.
 * The following assertions have to be met:
 * - the state is immutable and can only be modified via {@link setState } and {@link applyAction }
 * - {@link  applyAction} on the same state is a pure function
 * - if a proposedAction succeeds, the action should be applied to the state via {@link performAction}
 */
export class OptimisticActionHandler<
    Action extends object,
    State extends object,
    ServerResponse extends any
> {
    /**
     * The actions that should be proposed to the server after the waiting period has passed
     */
    private proposeActionQueue: {
        action: Action;
        optimistic: boolean;
        resolve: (
            response: ServerResponse | PromiseLike<ServerResponse>
        ) => void;
    }[] = [];
    /**
     * The actions that have been send from the server and should be performed since the start of the current waiting period
     */
    private performActionQueue: Action[] = [];

    /**
     * Wether we are waiting for the response to an optimistic action
     */
    private isWaiting = false;

    constructor(
        /**
         * This function has to set the state synchronously to another value
         * The state is required to be immutable!
         */
        private readonly setState: (state: State) => void,
        /**
         * Returns the current state synchronously
         * The state is required to be immutable!
         */
        private readonly getState: () => State,
        /**
         * Applies (reduces) the state to the state
         * The state is required to be immutable!
         */
        private readonly applyAction: (action: Action) => void,
        /**
         * Sends the action to the server and resolves with a response
         */
        private readonly sendAction: (action: Action) => Promise<ServerResponse>
    ) {}

    /**
     *
     * @param action the action that should be proposed to the server
     * @param optimistic wether the action should be applied before the server responds (in a way that the state doesn't get corrupted because of another action order on the server side)
     * @returns the response of the server
     */
    public async proposeAction<A extends Action>(
        action: A,
        optimistic: boolean
    ): Promise<ServerResponse> {
        if (this.isWaiting) {
            return new Promise((resolve) => {
                // we don't want to apply another action while we are waiting for the response of the previous one
                this.proposeActionQueue.push({ action, optimistic, resolve });
            });
        }
        if (!optimistic) {
            // we just send the action to the server
            // if the action changes the state, we will be notified via a performAction call instead of this response
            return this.sendAction(action);
        }
        this.isWaiting = true;
        const state = this.getState();
        this.applyAction(action);
        const response = await this.sendAction(action);
        // we reset the state to the state before the action was applied
        this.setState(state);
        this.isWaiting = false;
        // we apply all the actions from the server (in order) that were send in the meantime
        this.performActionQueue.forEach((action) => this.applyAction(action));
        this.performActionQueue = [];
        // we propose the actions that were proposed in the meantime
        // if another optimistic update is made during the loop
        // proposeActionQueue would gain elements in the back. we don't want to iterate over them
        const proposedActionLength = this.proposeActionQueue.length;
        for (let i = 0; i < proposedActionLength; i++) {
            const { action, optimistic, resolve } =
                this.proposeActionQueue.shift()!;
            resolve(this.proposeAction(action, optimistic));
        }
        return response;
    }

    /**
     * Only and all actions that are send from the server should be applied via this function
     * It is expected that successfully proposed actions are applied via this function too
     * @param action
     */
    public performAction<A extends Action>(action: A) {
        if (this.isWaiting) {
            this.performActionQueue.push(action);
        }
        this.applyAction(action);
    }
}
