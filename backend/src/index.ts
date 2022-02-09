import { FuesimServer } from './fuesim-server';

export const websocketPort = 3200;
export const webserverPort = 3201;

new FuesimServer(websocketPort, webserverPort);
