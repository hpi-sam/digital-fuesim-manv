import type {
    Immutable,
    ImmutableJsonObject,
} from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash';

/**
 * This class handels optimistic actions on a state.
 * The following assertions have to be met:
 * - the state is immutable and can only be modified via {@link setState } and {@link applyAction }
 * - {@link  applyAction} on the same state is a pure function
 * - if a proposedAction succeeds, the action should be applied to the state via {@link performAction}
 */
export class OptimisticActionHandler<
    Action extends ImmutableJsonObject,
    State extends ImmutableJsonObject,
    ServerResponse,
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
     * The state that is only assembled by the first `getState` and actions that came from the server
     */
    private saveState = this.getState();

    /**
     * The actions that have already been optimistically applied to the state and have been send to the server
     * The first element is the action that was first applied to the state
     */
    private readonly optimisticallyAppliedActions: ImmutableAction[] = [];

    /**
     * Remove the first action in {@link optimisticallyAppliedActions} that is deepEqual to the given @param action
     * @returns true if an action was removed, false otherwise
     */
    private removeFirstOptimisticAction(action: ImmutableAction) {
        const actionIndexInQueue = this.optimisticallyAppliedActions.findIndex(
            (optimisticAction) => isEqual(optimisticAction, action)
        );
        if (actionIndexInQueue > 0) {
            this.optimisticallyAppliedActions.splice(actionIndexInQueue, 1);
            return true;
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
        // Remove the response from the queue if it is still in there
        // We assume the proposed actions are resolved in the same order they were proposed
        if (this.removeFirstOptimisticAction(proposedAction)) {
            // TODO: reset the state if the response is not successful
            // Reset the state
            this.setState(this.saveState);
            // Apply the server action and afterwards the remaining optimistic actions
            this.optimisticallyAppliedActions.forEach((_action) => {
                this.applyAction(_action);
            });
        }
        return response;
    }

    /**
     * Only and all actions that are send from the server should be applied via this function
     * It is expected that successfully proposed actions are applied via this function too
     * @param action
     */
    public performAction<A extends ImmutableAction>(action: A) {
        if (this.optimisticallyAppliedActions.length <= 0) {
            this.applyAction(action);
            this.saveState = this.getState();
            return;
        }
        if (isEqual(this.optimisticallyAppliedActions[0], action)) {
            // Remove the already applied action
            this.optimisticallyAppliedActions.shift();
            // The state is already up to date
            this.saveState = this.getState();
            return;
        }
        console.log(
            'C',
            this.optimisticallyAppliedActions,
            action,
            this.saveState
        );

        // Remove the first matching optimisticAction (if there is one) from the queue
        this.removeFirstOptimisticAction(action);
        // Reset the state
        this.setState(this.saveState);
        // Apply the server action and afterwards the remaining optimistic actions
        [action, ...this.optimisticallyAppliedActions].forEach((_action) => {
            this.applyAction(_action);
        });
        // Save the state
        this.saveState = this.getState();
    }
}
