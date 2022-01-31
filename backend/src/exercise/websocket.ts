import { createServer } from 'node:http';
import type * as core from 'express-serve-static-core';
import { Server } from 'socket.io';
import { socketIoTransports } from 'digital-fuesim-manv-shared';
import type { ExerciseSocket, ExerciseServer } from '../exercise-server';
import { clientMap } from './client-map';
import { ClientWrapper } from './client-wrapper';
import {
    registerGetStateHandler,
    registerJoinExerciseHandler,
    registerProposeActionHandler,
} from './websocket-handler';
import { PerformanceMonitor } from './performance-monitor';

export class ExerciseWebsocketServer {
    public readonly exerciseServer: ExerciseServer;

    private readonly performanceMonitor = new PerformanceMonitor();

    public constructor(app: core.Express, port: number) {
        const server = createServer(app);

        this.exerciseServer = new Server(server, {
            // TODO: this is only a temporary solution to make this work
            cors: {
                origin: '*',
            },
            transports: socketIoTransports,
        });

        this.exerciseServer.listen(port);

        this.exerciseServer.on('connection', (socket) => {
            this.registerClient(socket);
        });
    }

    private registerClient(client: ExerciseSocket): void {
        // Add client
        clientMap.set(client, new ClientWrapper(client));
        client.onAny(() => this.performanceMonitor.messageReceived());
        const originalEmit = client.emit;
        client.emit = ((...args: any[]) => {
            // TODO: this doesn't seem to factor in callbacks
            this.performanceMonitor.messageSend();
            originalEmit.apply(client, Array.prototype.slice.call(args) as any);
        }) as any;
        // register handlers
        registerGetStateHandler(this.exerciseServer, client);
        registerProposeActionHandler(this.exerciseServer, client);
        registerJoinExerciseHandler(this.exerciseServer, client);

        // Register disconnect handler
        client.on('disconnect', () => {
            clientMap.get(client)!.leaveExercise();
            clientMap.delete(client);
        });
    }

    public close(): void {
        this.exerciseServer.close();
    }
}
