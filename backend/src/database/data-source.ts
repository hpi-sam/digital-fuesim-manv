import { DataSource } from 'typeorm';
// import { ActionEmitter } from '../exercise/action-emitter';
import { ActionWrapper } from '../exercise/action-wrapper';
import { Config } from '../config';
import { ActionEmitter, ExerciseWrapper } from '../exercise/exercise-wrapper';

export const createNewDataSource = () => {
    Config.initialize();
    return new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: Config.dbUser,
        password: Config.dbPassword,
        database: Config.dbName,
        entities: [ActionEmitter, ActionWrapper, ExerciseWrapper],
        migrations: [
            process.env.NODE_ENV === 'migration'
                ? `src/database/migrations/**/*{.ts,.js}`
                : `./migrations/**/*{.ts,.js}`,
        ],
        logging: Config.dbLogging,
    });
};
