import { config } from 'dotenv';

// Parse ../.env as env file
(() => config({ path: '../.env' }))();
