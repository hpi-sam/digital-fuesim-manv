import type { ExerciseIds, ExerciseTimeline } from 'digital-fuesim-manv-shared';
import { UserReadableIdGenerator } from '../../../utils/user-readable-id-generator';
import { exerciseMap } from '../../exercise-map';
import { ExerciseWrapper } from '../../exercise-wrapper';
import type { HttpResponse } from '../utils';

export function postExercise(): HttpResponse<ExerciseIds> {
    let newParticipantId: string | undefined;
    let newTrainerId: string | undefined;
    try {
        newParticipantId = UserReadableIdGenerator.generateId();
        newTrainerId = UserReadableIdGenerator.generateId(8);
        const newExercise = new ExerciseWrapper(newParticipantId, newTrainerId);
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
    if (exerciseWrapper.getRoleFromUsedId(exerciseId) !== 'trainer') {
        return {
            statusCode: 403,
            body: {
                message:
                    'Exercises can only be deleted by using their trainer id',
            },
        };
    }
    exerciseWrapper.deleteExercise();
    return {
        statusCode: 204,
        body: undefined,
    };
}

export function getExerciseHistory(
    exerciseId: string
): HttpResponse<ExerciseTimeline> {
    const exerciseWrapper = exerciseMap.get(exerciseId);
    if (exerciseWrapper === undefined) {
        return {
            statusCode: 404,
            body: {
                message: `Exercise with id '${exerciseId}' was not found`,
            },
        };
    }
    return {
        statusCode: 200,
        body: exerciseWrapper.getTimeLine(),
    };
}
