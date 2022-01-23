import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';
import {
    reduceExerciseState,
    generateExercise,
} from 'digital-fuesim-manv-shared';
import type { ClientWrapper } from './client-wrapper';

export class ExerciseWrapper {
    private readonly clients = new Set<ClientWrapper>();

    private currentState = generateExercise();

    private readonly stateHistory: ExerciseState[] = [];

    public getStateSnapshot(): ExerciseState {
        return this.currentState;
    }

    // TODO: To more generic function
    public emitAction(action: ExerciseAction) {
        this.clients.forEach((client) => client.emitAction(action));
    }

    public addClient(clientWrapper: ClientWrapper) {
        if (clientWrapper.client === undefined) {
            return;
        }
        const addClientAction: ExerciseAction = {
            type: '[Client] Add client',
            client: clientWrapper.client,
        };
        this.reduce(addClientAction);
        this.emitAction(addClientAction);
        // Only after all this add the client in order to not send the action adding itself to it
        this.clients.add(clientWrapper);
    }

    public removeClient(clientWrapper: ClientWrapper) {
        if (!this.clients.has(clientWrapper)) {
            // clientWrapper not part of this exercise
            return;
        }
        const removeClientAction: ExerciseAction = {
            type: '[Client] Remove client',
            clientId: clientWrapper.client!.id,
        };
        this.reduce(removeClientAction);
        this.clients.delete(clientWrapper);
        this.emitAction(removeClientAction);
    }

    /**
     * Applies the action on the current state.
     * @throws Error if the action is not applicable on the current state
     */
    public reduce(action: ExerciseAction): void {
        const newState = reduceExerciseState(this.currentState, action);
        this.setState(newState);
    }

    private setState(newExerciseState: ExerciseState): void {
        this.stateHistory.push(this.currentState);
        this.currentState = newExerciseState;
    }
}
