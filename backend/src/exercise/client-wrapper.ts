import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import { Client } from 'digital-fuesim-manv-shared';
import type { ExerciseSocket } from '../exercise-server';
import { exerciseMap } from './exercise-map';
import type { ExerciseWrapper } from './exercise-wrapper';

export class ClientWrapper {
    public constructor(private readonly socket: ExerciseSocket) {}

    private chosenExercise?: ExerciseWrapper;

    private relatedExerciseClient?: Client;

    /**
     * @param exerciseId The exercise id to be used for the client.
     * @param clientName The public name of the client.
     * @returns Whether the exercise exists.
     */
    public joinExercise(exerciseId: string, clientName: string): boolean {
        const exercise = exerciseMap.get(exerciseId);
        if (!exercise) {
            return false;
        }
        this.chosenExercise = exercise;
        // Although getRoleFromUsedId may throw an error, this should never happen here
        // as the provided id is guaranteed to be one of the ids of the exercise as the exercise
        // was fetched with this exact id from the exercise map.
        const role = this.chosenExercise.getRoleFromUsedId(exerciseId);
        this.relatedExerciseClient = new Client(clientName, role, undefined);
        this.chosenExercise.addClient(this);
        return true;
    }

    /**
     * Note that this method simply returns when the client did not join an exercise.
     */
    public leaveExercise() {
        if (this.chosenExercise === undefined) {
            // The client has not joined an exercise. Do nothing.
            return;
        }
        this.chosenExercise.removeClient(this);
    }

    public get exercise(): ExerciseWrapper | undefined {
        return this.chosenExercise;
    }

    public get client(): Client | undefined {
        return this.relatedExerciseClient;
    }

    public emitAction(action: ExerciseAction) {
        this.socket.emit('performAction', action);
    }

    public disconnect() {
        this.socket.disconnect();
    }
}
