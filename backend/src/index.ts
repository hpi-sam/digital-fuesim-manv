import 'dotenv/config';
import { Config } from './config';
import { createNewDataSource } from './database/data-source';
import { FuesimServer } from './fuesim-server';

Config.initialize();

if (Config.useDataBase) {
    await createNewDataSource().initialize();
}

// eslint-disable-next-line no-new
new FuesimServer();
