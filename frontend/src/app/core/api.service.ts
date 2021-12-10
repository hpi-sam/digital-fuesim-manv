import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ExerciseAction } from 'digital-fuesim-manv-shared';
import { AppState } from '../state/app.state';
import { io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly socket = io(
        `ws://${window.location.host.split(':')[0]}:3200`
    );

    constructor(private readonly store: Store<AppState>) {
        this.socket.on('connect', () => {
            console.log('Socket connected', this.socket.id);
        });
        this.socket.on('disconnect', () => {
            console.log('Socket disconnected', this.socket.id);
        });
        this.socket.on('action', (action: ExerciseAction) => {
            this.store.dispatch(action);
        });
    }

    public sendAction<A extends ExerciseAction>(
        action: A,
        optimistic = false
    ): Promise<any> {
        console.log(action);
        this.socket.emit('action', action);
        // this.store.dispatch(action as Action);
        // TODO: wait for response message from server
        return Promise.resolve();
    }
}
