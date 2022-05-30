import { plainToInstance } from 'class-transformer';
import type { DatabaseService } from 'database/services/database-service';
import type { ExerciseIds } from 'digital-fuesim-manv-shared';
import {
    ReducerError,
    StateExport,
    validateExerciseExport,
} from 'digital-fuesim-manv-shared';
import { ExerciseWrapper } from '../exercise/exercise-wrapper';
import type { HttpResponse } from '../exercise/http-handler/utils';

export async function importExercise(
    importObject: StateExport,
    ids: ExerciseIds,
    databaseService: DatabaseService
): Promise<ExerciseWrapper | HttpResponse<ExerciseIds>> {
    // console.log(
    //     inspect(importObject.history, { depth: 2, colors: true })
    // );
    const importInstance = plainToInstance(
        StateExport,
        importObject
        // TODO: verify that this is indeed not required
        // // Workaround for https://github.com/typestack/class-transformer/issues/876
        // { enableImplicitConversion: true }
    );
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
        return await ExerciseWrapper.importFromFile(
            databaseService,
            importInstance,
            {
                participantId: ids.participantId,
                trainerId: ids.trainerId,
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
