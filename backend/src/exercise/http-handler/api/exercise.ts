import type {
    ExerciseIds,
    ExerciseTimeline,
    StateExport,
} from 'digital-fuesim-manv-shared';
import { ExerciseState } from 'digital-fuesim-manv-shared';
import { isEmpty } from 'lodash-es';
import { importExercise } from '../../../utils/import-exercise';
import type { DatabaseService } from '../../../database/services/database-service';
import { UserReadableIdGenerator } from '../../../utils/user-readable-id-generator';
import { exerciseMap } from '../../exercise-map';
import { ExerciseWrapper } from '../../exercise-wrapper';
import type { HttpResponse } from '../utils';

export async function postExercise(
    databaseService: DatabaseService,
    importObject: StateExport
): Promise<HttpResponse<ExerciseIds>> {
    try {
        const participantId = UserReadableIdGenerator.generateId();
        const trainerId = UserReadableIdGenerator.generateId(8);
        const newExerciseOrError = isEmpty(importObject)
            ? ExerciseWrapper.create(
                  participantId,
                  trainerId,
                  databaseService,
                  ExerciseState.create()
              )
            : await importExercise(
                  importObject,
                  { participantId, trainerId },
                  databaseService
              );
        if (!(newExerciseOrError instanceof ExerciseWrapper)) {
            return newExerciseOrError;
        }
        exerciseMap.set(participantId, newExerciseOrError);
        exerciseMap.set(trainerId, newExerciseOrError);
        return {
            statusCode: 201,
            body: {
                participantId,
                trainerId,
            },
        };
    } catch (error: unknown) {
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

export async function getExerciseHistory(
    exerciseId: string
): Promise<HttpResponse<ExerciseTimeline>> {
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
        body: await exerciseWrapper.getTimeLine(),
    };
}
