import 'dotenv/config';
import { Config } from './config';
import { FuesimServer } from './fuesim-server';

Config.initialize();
new FuesimServer();
