// This environment is set at the backend and (manually) on the frontend, therefore we can use it in here
declare global {
    const process: {
        env: {
            NODE_ENV: 'development' | 'production';
        };
    };
}

export const isDevelopment = process?.env?.NODE_ENV === 'development';
