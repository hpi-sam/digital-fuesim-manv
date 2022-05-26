import { Config } from './config';
import { createNewDataSource } from './database/data-source';
import { DatabaseService } from './database/services/database-service';
import { FuesimServer } from './fuesim-server';

async function main() {
    Config.initialize();

    const dataSource = await createNewDataSource().initialize();
    const databaseService = new DatabaseService(dataSource);
    // eslint-disable-next-line no-new
    new FuesimServer(databaseService);
}

main();
