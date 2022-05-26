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
    // eslint-disable-next-line no-new
    new FuesimServer(databaseService);
}

main();
