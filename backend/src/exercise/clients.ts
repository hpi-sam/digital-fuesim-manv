import type { ExerciseSocket } from '../exercise-server';
import { exerciseMap } from './exercise-map';
import type { ExerciseWrapper } from './exercise-wrapper';

export class Client {
    public constructor(
        private readonly socket: ExerciseSocket,
        private chosenExercise?: ExerciseWrapper
    ) {}

    /**
     * @param exerciseId The exercise id to be used for the client.
     * @returns Whether the exercise exists.
     */
    public setExercise(exerciseId: string): boolean {
        if (!exerciseMap.has(exerciseId)) {
            return false;
        }
        this.chosenExercise = exerciseMap.get(exerciseId);
        return true;
    }

    public get exercise(): ExerciseWrapper | undefined {
        return this.chosenExercise;
    }
}
