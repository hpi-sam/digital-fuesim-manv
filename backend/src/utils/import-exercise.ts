import { plainToInstance } from 'class-transformer';
import type {
    ExerciseIds,
    HistoryImportStrategy,
} from 'digital-fuesim-manv-shared';
import {
    migrateStateExport,
    ReducerError,
    StateExport,
    validateExerciseExport,
} from 'digital-fuesim-manv-shared';
import type { DatabaseService } from '../database/services/database-service';
import { ExerciseWrapper } from '../exercise/exercise-wrapper';
import type { HttpResponse } from '../exercise/http-handler/utils';

export async function importExercise(
    importObject: StateExport,
    ids: ExerciseIds,
    options: { historyImportStrategy: HistoryImportStrategy },
    databaseService: DatabaseService
): Promise<ExerciseWrapper | HttpResponse<ExerciseIds>> {
    const migratedImportObject = migrateStateExport(importObject, options);
    const importInstance = plainToInstance(
        StateExport,
        migratedImportObject
        // TODO: verify that this is indeed not required
        // // Workaround for https://github.com/typestack/class-transformer/issues/876
        // { enableImplicitConversion: true }
    );

    const validationErrors = validateExerciseExport(importInstance);
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
