import type { ExerciseId } from 'digital-fuesim-manv-shared';
import { UserReadableIdGenerator } from '../../../utils/user-readable-id-generator';
import { exerciseMap } from '../../exercise-map';
import { ExerciseWrapper } from '../../exercise-wrapper';
import { HttpResponse } from '../utils';

export function postExercise(): HttpResponse<ExerciseId> {
    try {
        const newExerciseId = UserReadableIdGenerator.generateId();
        exerciseMap.set(newExerciseId, new ExerciseWrapper(newExerciseId));
        return {
            statusCode: 201,
            body: {
                exerciseId: newExerciseId,
            },
        };
    } catch (error: any) {
        if (error instanceof RangeError) {
            return {
                statusCode: 503,
                body: {
                    message: 'No ids available.',
                },
            };
        }
        throw error;
    }
}

export function deleteExercise(exerciseId: string): HttpResponse {
    const exerciseWrapper = exerciseMap.get(exerciseId);
    if (exerciseWrapper === undefined) {
        return {
            statusCode: 404,
            body: {
                message: `Exercise with id '${exerciseId}' was not found`,
            },
        };
    }
    exerciseWrapper.deleteExercise();
    return {
        statusCode: 204,
        body: undefined,
    };
}
