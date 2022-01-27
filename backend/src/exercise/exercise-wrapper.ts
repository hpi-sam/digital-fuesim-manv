import type {
    ExerciseAction,
    ExerciseState,
    Role,
} from 'digital-fuesim-manv-shared';
import {
    reduceExerciseState,
    generateExercise,
} from 'digital-fuesim-manv-shared';
import type { ClientWrapper } from './client-wrapper';
import { exerciseMap } from './exercise-map';

export class ExerciseWrapper {
    private readonly clients = new Set<ClientWrapper>();

    private currentState = generateExercise();

    private readonly stateHistory: ExerciseState[] = [];

    constructor(
        private readonly participantId: string,
        private readonly trainerId: string
    ) {}

    /**
     * Select the role that is applied when using the given id.
     * @param id The id the client used.
     * @returns The role of the client, determined by the id.
     * @throws {@link RangeError} in case the provided {@link id} is not part of this exercise.
     */
    public getRoleFromUsedId(id: string): Role {
        switch (id) {
            case this.participantId:
                return 'participant';
            case this.trainerId:
                return 'trainer';
            default:
                throw new RangeError(
                    `Incorrect id: ${id} where pid=${this.participantId} and tid=${this.trainerId}`
                );
        }
    }

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

    public deleteExercise() {
        this.clients.forEach((client) => client.disconnect());
        exerciseMap.delete(this.participantId);
        exerciseMap.delete(this.trainerId);
    }
}
