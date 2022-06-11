import type {
    Immutable,
    ImmutableJsonObject,
    SocketResponse,
} from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash';

/**
 * This class handles optimistic actions on a state.
 * The following assertions have to be met:
 * - the state is immutable and can only be modified via {@link setState } and {@link applyAction }
 * - {@link  applyAction} on the same state is a pure function
 * - if a proposedAction succeeds, the action should be applied to the state via {@link performAction}
 *     - this performAction must be called before the action resolves successfully
 */
export class OptimisticActionHandler<
    Action extends ImmutableJsonObject,
    State extends ImmutableJsonObject,
    ServerResponse extends SocketResponse,
    ImmutableAction extends Immutable<Action> = Immutable<Action>,
    ImmutableState extends Immutable<State> = Immutable<State>
> {
    constructor(
        /**
         * This function has to set the state synchronously to another value
         */
        private readonly setState: (state: ImmutableState) => void,
        /**
         * Returns the current state synchronously
         * It is expected that the first `getState` is in sync with the server
         */
        private readonly getState: () => ImmutableState,
        /**
         * Applies (reduces) the action to the state
         * It could happen that the action is not applicable to the state.
         * This happens e.g. if an optimistic action is applied, but the server state changed in the meantime.
         * In this case the action can just be ignored.
         *
         */
        private readonly applyAction: (action: ImmutableAction) => void,
        /**
         * Sends the action to the server and resolves with the servers response
         */
        private readonly sendAction: (
            action: ImmutableAction
        ) => Promise<ServerResponse>
    ) {}

    /**
     * The state that is confirmed to be valid by the server.
     * It is only assembled by the first `getState` and actions that came from the server via {@link performAction}
     */
    private serverState = this.getState();

    /**
     * The actions that have already been optimistically applied to the state and have been send to the server
     * The first element is the action that was first applied to the state
     *
     * {@link getState()} === {@link serverState} + ...{@link optimisticallyAppliedActions}
     */
    private readonly optimisticallyAppliedActions: ImmutableAction[] = [];

    /**
     * Remove the first action in {@link optimisticallyAppliedActions} that is deepEqual to the given @param action
     * @returns true if an action was removed, false otherwise
     */
    private removeFirstOptimisticAction(action: ImmutableAction) {
        for (let i = 0; i < this.optimisticallyAppliedActions.length; i++) {
            if (isEqual(this.optimisticallyAppliedActions[i], action)) {
                this.optimisticallyAppliedActions.splice(i, 1);
                return true;
            }
        }
        return false;
    }

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
        if (!beOptimistic) {
            return this.sendAction(proposedAction);
        }
        this.optimisticallyAppliedActions.push(proposedAction);
        this.applyAction(proposedAction);
        const response = await this.sendAction(proposedAction);
        if (response.success) {
            // If the response is successful the actions has already been removed by the `performAction` function before.
            return response;
        }
        // Remove the action from the applied actions
        this.removeFirstOptimisticAction(proposedAction);
        this.setState(this.serverState);
        this.optimisticallyAppliedActions.forEach((_action) => {
            this.applyAction(_action);
        });
        return response;
    }

    /**
     * Only and all actions that are send from the server should be applied via this function
     * It is expected that successfully proposed actions are applied via this function too
     * @param action
     */
    public performAction<A extends ImmutableAction>(action: A) {
        // This is a shortcut to improve performance for obvious cases - If you remove it the code is still correct
        if (this.optimisticallyAppliedActions.length === 0) {
            this.applyAction(action);
            this.serverState = this.getState();
            return;
        }

        // This is a shortcut to improve performance for obvious cases - If you remove it the code is still correct
        if (
            // If there are more optimistic actions, the state would already be correct, but we have no way to set the correct saveState
            this.optimisticallyAppliedActions.length === 1 &&
            isEqual(this.optimisticallyAppliedActions[0], action)
        ) {
            // Remove the already applied action
            this.optimisticallyAppliedActions.shift();
            // The state is already up to date
            this.serverState = this.getState();
            return;
        }

        // Here comes the general and "safe" way:

        // Remove the first matching optimisticAction (if there is one)
        this.removeFirstOptimisticAction(action);
        // Reset the state
        this.setState(this.serverState);
        // Apply the server action
        this.applyAction(action);
        // Save the state
        this.serverState = this.getState();
        // Apply the remaining optimistic actions
        this.optimisticallyAppliedActions.forEach((_action) => {
            this.applyAction(_action);
        });
    }
}
