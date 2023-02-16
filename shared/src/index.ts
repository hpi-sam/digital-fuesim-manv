// this import is needed for `import { Type } from 'class-transformer';` to work
import 'reflect-metadata';

// This environment is set at the backend and (manually) on the frontend, therefore we can use it in here
declare global {
    const process: {
        env: {
            NODE_ENV:
                | string
                | 'development'
                | 'production'
                | 'staging'
                | 'testing';
        };
    };
}

export * from './export-import/file-format';
export * from './models';
export * from './models/utils';
export * from './utils';
export * from './simulation';
export * from './state';
export * from './store';
export * from './socket-api';
export * from './http-interfaces';
export * from './state-helpers';
export * from './data';
export * from './store/action-reducers/utils';
export * from './state-migrations';
