import * as util from 'node:util';
import { ReducerError } from 'digital-fuesim-manv-shared';
import { ValidationErrorWrapper } from './utils/validation-error-wrapper';
import { RestoreError } from './utils/restore-error';
import { ExerciseWrapper } from './exercise/exercise-wrapper';
import { Config } from './config';
import { createNewDataSource } from './database/data-source';
import { DatabaseService } from './database/services/database-service';
import { FuesimServer } from './fuesim-server';

async function main() {
    Config.initialize();

    const dataSource = createNewDataSource();
    if (Config.useDb) {
        try {
            await dataSource.initialize();
        } catch (e: unknown) {
            console.error('Error connecting to the database:', e);
            return;
        }
        console.log('Successfully connected to the database.');
    } else {
        console.warn(
            'Note that no database gets used. This means any data created will be stored in-memory until the exercise gets deleted or the server stops, and in case the server stops all data is gone.'
        );
    }
    const databaseService = new DatabaseService(dataSource);
    if (Config.useDb) {
        try {
            console.log('Loading exercises from database…');
            const startTime = performance.now();
            const exercises = await ExerciseWrapper.restoreAllExercises(
                databaseService
            );
            const endTime = performance.now();
            console.log(
                `✅ Successfully loaded ${exercises.length} exercise(s) in ${(
                    endTime - startTime
                ).toFixed(3)} ms.`
            );
        } catch (e: unknown) {
            console.error('❌ An error occurred while loading exercises.');
            if (e instanceof ValidationErrorWrapper) {
                console.error(
                    'The validation of the exercises and actions in the database failed:',
                    util.inspect(e.errors, false, null, true)
                );
                return;
            } else if (e instanceof ReducerError) {
                console.error('Could not apply an action:', e.message, e.stack);
                return;
            } else if (e instanceof RestoreError) {
                console.error(
                    `Error while restoring exercise \`${e.exerciseId}\`:`,
                    e.message,
                    e.stack
                );
                return;
            }
            throw e;
        }
    }
    // eslint-disable-next-line no-new
    new FuesimServer(databaseService);
}

main();
