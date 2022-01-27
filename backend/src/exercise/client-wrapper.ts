import type { ExerciseAction, UUID } from 'digital-fuesim-manv-shared';
import { Client } from 'digital-fuesim-manv-shared';
import type { Role } from 'digital-fuesim-manv-shared/dist/models/utils';
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
     * @returns The joined client's id, or undefined when the exercise doesn't exists.
     */
    public joinExercise(
        exerciseId: string,
        clientName: string,
        role: Role
    ): UUID | undefined {
        if (!exerciseMap.has(exerciseId)) {
            return undefined;
        }
        this.chosenExercise = exerciseMap.get(exerciseId);
        this.relatedExerciseClient = new Client(clientName, role, undefined);
        this.chosenExercise!.addClient(this);
        return this.relatedExerciseClient.id;
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
