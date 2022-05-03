import 'dotenv/config';
import { Config } from './config';
import { createNewDataSource } from './database/data-source';
import { ServiceProvider } from './database/services/service-provider';
import { FuesimServer } from './fuesim-server';

async function main() {
    Config.initialize();

    const dataSource = await createNewDataSource().initialize();
    const services = new ServiceProvider(dataSource);
    // eslint-disable-next-line no-new
    new FuesimServer(services);
}

main();
