import { FuesimServer } from './fuesim-server';

export const websocketPort = 3200;
export const webserverPort = 3201;

FuesimServer.create(websocketPort, webserverPort);
