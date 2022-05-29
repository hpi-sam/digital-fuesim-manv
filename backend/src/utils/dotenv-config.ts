import fs from 'node:fs';
import { config } from 'dotenv';

// Parse ../.env as env file (if it exists)
const pathToEnv = '../.env';
if (fs.existsSync(pathToEnv)) {
    config({ path: pathToEnv });
}
