import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';
import {
    reduceExerciseState,
    generateExercise,
} from 'digital-fuesim-manv-shared';
import type { ClientWrapper } from './client-wrapper';
import { exerciseMap } from './exercise-map';

export class ExerciseWrapper {
    private readonly clients: ClientWrapper[] = [];

    private currentState = generateExercise();

    private readonly stateHistory: ExerciseState[] = [];

    constructor(private readonly exerciseId: string) {}

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
        this.clients.push(clientWrapper);
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

    public deleteExercise() {
        this.clients.forEach((client) => client.disconnect());
        exerciseMap.delete(this.exerciseId);
    }
}
