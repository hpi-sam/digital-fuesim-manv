import { DataSource } from 'typeorm';
import { Config } from '../config';
import {
    ActionEmitterEntity,
    ActionWrapperEntity,
    ExerciseWrapperEntity,
} from './entities/all-entities';
import { AddExerciseAndActions1652268120769 } from './migrations/1652268120769-AddExerciseAndActions';

export type DataSourceMode = 'baseline' | 'default' | 'testing';

export let testingDatabaseName: string;

export const createNewDataSource = (mode: DataSourceMode = 'default') => {
    Config.initialize();
    const defaultDatabaseName = `${Config.dbName}`;
    testingDatabaseName = `${Config.dbName}_TESTING`;
    return new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: Config.dbUser,
        password: Config.dbPassword,
        database:
            mode === 'baseline'
                ? // This database probably always exists
                  'postgres'
                : mode === 'default'
                ? defaultDatabaseName
                : testingDatabaseName,
        entities: [
            ActionEmitterEntity,
            ActionWrapperEntity,
            ExerciseWrapperEntity,
        ],
        // migrations: [
        //     process.env.NODE_ENV === 'migration' || mode === 'testing'
        //         ? `src/database/migrations/**/*{.ts,.js}`
        //         : `./migrations/**/*{.ts,.js}`,
        // ],
        migrations: [AddExerciseAndActions1652268120769],
        logging: Config.dbLogging,
    });
};
