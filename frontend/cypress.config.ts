import { defineConfig } from 'cypress';

export default defineConfig({
    retries: {
        runMode: 4,
    },
    e2e: {
        baseUrl: 'http://127.0.0.1:4200',
        experimentalStudio: true,
    },
});
