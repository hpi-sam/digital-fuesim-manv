import type { ExerciseIds } from 'digital-fuesim-manv-shared';
import { ExerciseState } from 'digital-fuesim-manv-shared';
import type { DatabaseService } from '../../../database/services/database-service';
import { UserReadableIdGenerator } from '../../../utils/user-readable-id-generator';
import { exerciseMap } from '../../exercise-map';
import { ExerciseWrapper } from '../../exercise-wrapper';
import type { HttpResponse } from '../utils';

export async function postExercise(
    databaseService: DatabaseService
): Promise<HttpResponse<ExerciseIds>> {
    let newParticipantId: string | undefined;
    let newTrainerId: string | undefined;
    try {
        newParticipantId = UserReadableIdGenerator.generateId();
        newTrainerId = UserReadableIdGenerator.generateId(8);
        const newExercise = await ExerciseWrapper.create(
            newParticipantId,
            newTrainerId,
            databaseService,
            ExerciseState.create()
        );
        exerciseMap.set(newParticipantId, newExercise);
        exerciseMap.set(newTrainerId, newExercise);
        return {
            statusCode: 201,
            body: {
                participantId: newParticipantId,
                trainerId: newTrainerId,
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

export function getExercise(exerciseId: string): HttpResponse {
    const exerciseExists = exerciseMap.has(exerciseId);
    return {
        statusCode: exerciseExists ? 200 : 404,
        body: undefined,
    };
}

export async function deleteExercise(
    exerciseId: string
): Promise<HttpResponse> {
    const exerciseWrapper = exerciseMap.get(exerciseId);
    if (exerciseWrapper === undefined) {
        return {
            statusCode: 404,
            body: {
                message: `Exercise with id '${exerciseId}' was not found`,
            },
        };
    }
    if (exerciseWrapper.getRoleFromUsedId(exerciseId) !== 'trainer') {
        return {
            statusCode: 403,
            body: {
                message:
                    'Exercises can only be deleted by using their trainer id',
            },
        };
    }
    await exerciseWrapper.deleteExercise();
    return {
        statusCode: 204,
        body: undefined,
    };
}
