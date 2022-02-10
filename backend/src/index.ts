import 'dotenv/config';
import { Config } from './config';
import { FuesimServer } from './fuesim-server';

Config.initialize();

// eslint-disable-next-line no-new
new FuesimServer();
