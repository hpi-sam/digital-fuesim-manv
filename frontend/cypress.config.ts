import { defineConfig } from 'cypress';

export default defineConfig({
    retries: {
        runMode: 4,
        openMode: 1,
    },
    e2e: {
        baseUrl: 'http://127.0.0.1:4200',
        video: false,
    },
});
