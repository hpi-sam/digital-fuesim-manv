import { DataSource } from 'typeorm';
import { Config } from '../config';

export const createNewDataSource = () =>
    new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: Config.dbUser,
        password: Config.dbPassword,
        database: Config.dbName,
        entities: [],
        migrations: [`./migrations/**/*{.ts,.js}`],
    });
