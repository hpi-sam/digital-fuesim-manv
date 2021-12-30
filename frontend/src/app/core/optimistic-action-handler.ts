import type { Immutable } from 'digital-fuesim-manv-shared';

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
    ServerResponse,
    ImmutableAction extends Immutable<Action> = Immutable<Action>,
    ImmutableState extends Immutable<State> = Immutable<State>
> {
    /**
     * The actions that should be proposed to the server after the waiting period has passed
     */
    private readonly proposeActionQueue: {
        action: ImmutableAction;
        optimistic: boolean;
        resolve: (
            response: PromiseLike<ServerResponse> | ServerResponse
        ) => void;
    }[] = [];
    /**
     * The actions that have been send from the server and should be performed since the start of the current waiting period
     */
    private performActionQueue: ImmutableAction[] = [];

    /**
     * Wether we are waiting for the response to an optimistic action
     */
    private isWaiting = false;

    constructor(
        /**
         * This function has to set the state synchronously to another value
         */
        private readonly setState: (state: ImmutableState) => void,
        /**
         * Returns the current state synchronously
         */
        private readonly getState: () => ImmutableState,
        /**
         * Applies (reduces) the action to the state
         */
        private readonly applyAction: (action: ImmutableAction) => void,
        /**
         * Sends the action to the server and resolves with a the servers response
         */
        private readonly sendAction: (
            action: ImmutableAction
        ) => Promise<ServerResponse>
    ) {}

    /**
     *
     * @param proposedAction the action that should be proposed to the server
     * @param beOptimistic wether the action should be applied before the server responds (in a way that the state doesn't get corrupted because of another action order on the server side)
     * @returns the response of the server
     */
    public async proposeAction<A extends ImmutableAction>(
        proposedAction: A,
        beOptimistic: boolean
    ): Promise<ServerResponse> {
        if (this.isWaiting) {
            // directly apply the action if it's optimistic
            if (beOptimistic) {
                // the state we will reset to later has already been saved by the action we are currently waiting for
                this.applyAction(proposedAction);
            }
            // return the eventual response of the server to the action proposal
            return new Promise((resolve) => {
                // save to propose the action later
                this.proposeActionQueue.push({
                    action: proposedAction,
                    optimistic: beOptimistic,
                    resolve,
                });
            });
        }
        if (!beOptimistic) {
            // we just send the action to the server
            // if the action changes the state, we will be notified via a performAction call instead of this response
            return this.sendAction(proposedAction);
        }
        this.isWaiting = true;
        const state = this.getState();
        this.applyAction(proposedAction);
        const response = await this.sendAction(proposedAction);
        // we reset the state to the state before the action was applied
        this.setState(state);
        this.isWaiting = false;
        // we apply all the actions from the server (in order) that were sent in the meantime
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
    public performAction<A extends ImmutableAction>(action: A) {
        if (this.isWaiting) {
            this.performActionQueue.push(action);
        }
        this.applyAction(action);
    }
}
