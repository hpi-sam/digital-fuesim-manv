import { plainToInstance } from 'class-transformer';
import type { ExerciseIds, ExerciseTimeline } from 'digital-fuesim-manv-shared';
import {
    StateExport,
    ExerciseState,
    validateExerciseExport,
    ReducerError,
} from 'digital-fuesim-manv-shared';
import { isEmpty } from 'lodash-es';
import type { DatabaseService } from '../../../database/services/database-service';
import { UserReadableIdGenerator } from '../../../utils/user-readable-id-generator';
import { exerciseMap } from '../../exercise-map';
import { ExerciseWrapper } from '../../exercise-wrapper';
import type { HttpResponse } from '../utils';

export async function postExercise(
    databaseService: DatabaseService,
    importObject: StateExport
): Promise<HttpResponse<ExerciseIds>> {
    let newParticipantId: string | undefined;
    let newTrainerId: string | undefined;
    try {
        newParticipantId = UserReadableIdGenerator.generateId();
        newTrainerId = UserReadableIdGenerator.generateId(8);
        let newExercise: ExerciseWrapper;
        if (isEmpty(importObject)) {
            newExercise = ExerciseWrapper.create(
                newParticipantId,
                newTrainerId,
                databaseService,
                ExerciseState.create()
            );
        } else {
            // console.log(
            //     inspect(importObject.history, { depth: 2, colors: true })
            // );
            let importInstance: StateExport;
            try {
                importInstance = plainToInstance(
                    StateExport,
                    importObject
                    // TODO: verify that this is indeed not required
                    // // Workaround for https://github.com/typestack/class-transformer/issues/876
                    // { enableImplicitConversion: true }
                );
            } catch (e: unknown) {
                if (e instanceof SyntaxError) {
                    console.error(e, importObject);
                    return {
                        statusCode: 400,
                        body: {
                            message: 'Provided JSON has invalid format',
                        },
                    };
                }
                throw e;
            }
            // console.log(
            //     inspect(importInstance.history, { depth: 2, colors: true })
            // );
            const validationErrors = validateExerciseExport(importObject);
            if (validationErrors.length > 0) {
                return {
                    statusCode: 400,
                    body: {
                        message: `The validation of the import failed: ${validationErrors}`,
                    },
                };
            }
            try {
                newExercise = await ExerciseWrapper.importFromFile(
                    databaseService,
                    importInstance,
                    {
                        participantId: newParticipantId,
                        trainerId: newTrainerId,
                    }
                );
            } catch (e: unknown) {
                if (e instanceof ReducerError) {
                    return {
                        statusCode: 400,
                        body: {
                            message: `Error importing exercise: ${e.message}`,
                        },
                    };
                }
                throw e;
            }
        }
        exerciseMap.set(newParticipantId, newExercise);
        exerciseMap.set(newTrainerId, newExercise);
        return {
            statusCode: 201,
            body: {
                participantId: newParticipantId,
                trainerId: newTrainerId,
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
