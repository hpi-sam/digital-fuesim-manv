import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import {
    ClientToServerEvents,
    ExerciseAction,
    ServerToClientEvents,
    SocketResponse,
} from 'digital-fuesim-manv-shared';
import { AppState } from '../state/app.state';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly socket: Socket<
        ServerToClientEvents,
        ClientToServerEvents
    > = io(`ws://${window.location.host.split(':')[0]}:3200`);

    constructor(private readonly store: Store<AppState>) {
        this.socket.on('connect', () => {
            console.log('Socket connected', this.socket.id);
        });
        this.socket.on('disconnect', () => {
            console.log('Socket disconnected', this.socket.id);
        });
        this.socket.on('performAction', (action: ExerciseAction) => {
            this.store.dispatch(action);
        });
    }

    public async sendAction<A extends ExerciseAction>(
        action: A,
        optimistic = false
    ) {
        if (optimistic) {
            // TODO:
            this.store.dispatch(action as Action);
        }

        const response = await new Promise<SocketResponse>((resolve) => {
            this.socket.emit('proposeAction', action, resolve);
        });
        return response;
    }

    public joinExercise(exerciseId: string): Promise<SocketResponse> {
        return new Promise<SocketResponse>((resolve) => {
            this.socket.emit('joinExercise', exerciseId, resolve);
        });
    }
}
