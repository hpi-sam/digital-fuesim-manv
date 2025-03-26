import { DataSource } from 'typeorm';
import { Config } from '../config';
import { ActionWrapperEntity } from './entities/action-wrapper.entity';
import { ExerciseWrapperEntity } from './entities/exercise-wrapper.entity';
import { AddExerciseAndActions1653554608164 } from './migrations/1653554608164-AddExerciseAndActions';
import { AddStateVersion1653601072020 } from './migrations/1653601072020-AddStateVersion';

export type DataSourceMode = 'baseline' | 'default' | 'testing';

export let testingDatabaseName: string;

export const createNewDataSource = (mode: DataSourceMode = 'default') => {
    Config.initialize();
    const defaultDatabaseName = `${Config.dbName}`;
    testingDatabaseName = `${Config.dbName}_TESTING`;
    return new DataSource({
        type: 'postgres',
        host: Config.dbHost,
        port: Config.dbPort,
        username: Config.dbUser,
        password: Config.dbPassword,
        database:
            mode === 'baseline'
                ? // This database probably always exists
                  'postgres'
                : mode === 'default'
                  ? defaultDatabaseName
                  : testingDatabaseName,
        entities: [ActionWrapperEntity, ExerciseWrapperEntity],
        migrations: [
            AddExerciseAndActions1653554608164,
            AddStateVersion1653601072020,
        ],
        logging: Config.dbLogging,
    });
};
