// this import is needed for `import { Type } from 'class-transformer';` to work
import 'reflect-metadata';

// This environment is set at the backend and (manually) on the frontend, therefore we can use it in here
declare global {
    // TODO: This package can be used in browser or node host environment.
    // Therefore neither of their @types should be imported. Though, at the moment we
    // are importing @types/jest to get the unit tests working. @types/jest imports @types/node.
    // Therefore we get the error `Cannot redeclare block-scoped variable 'process'`.
    // The correct solution could be to not use @types/jest in the `tsconfig.build`, but instead
    // create an additional tsconfig for the tests.
    // const process: {
    //     env: {
    //         NODE_ENV:
    //             | string
    //             | 'development'
    //             | 'production'
    //             | 'staging'
    //             | 'testing';
    //     };
    // };
}

export * from './export-import/file-format';
export * from './models';
export * from './models/utils';
export * from './models/radiogram/index';
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
