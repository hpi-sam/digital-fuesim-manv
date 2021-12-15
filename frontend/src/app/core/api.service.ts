import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    ClientToServerEvents,
    ExerciseAction,
    ExerciseState,
    ServerToClientEvents,
    SocketResponse,
} from 'digital-fuesim-manv-shared';
import { AppState } from '../state/app.state';
import { io, Socket } from 'socket.io-client';
import { OptimisticActionHandler } from './optimistic-action-handler';
import { first } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly socket: Socket<
        ServerToClientEvents,
        ClientToServerEvents
    > = io(`ws://${window.location.host.split(':')[0]}:3200`);

    private readonly optimisticActionHandler = new OptimisticActionHandler<
        ExerciseAction,
        ExerciseState,
        SocketResponse
    >(
        (exercise) =>
            this.store.dispatch({
                type: '[Exercise] Set state',
                exercise,
            }),
        () => {
            // There is sadly currently no other way to get the state synchronously...
            let currentState: ExerciseState;
            // "Subscribing to Store will always be guaranteed to be synchronous" - https://github.com/ngrx/platform/issues/227#issuecomment-431682349
            this.store
                .select((state) => state.exercise)
                .pipe(first())
                .subscribe((s) => (currentState = s));
            return currentState!;
        },
        (action) => this.store.dispatch(action),
        this.sendAction
    );

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

    /**
     *
     * @param optimistic wether the action should be applied before the server responds (to reduce latency) (this update is guaranteed to be synchronous)
     * @returns the response of the server
     */
    public async proposeAction<A extends ExerciseAction>(
        action: A,
        optimistic = false
    ) {
        return this.optimisticActionHandler.proposeAction(action, optimistic);
    }

    public joinExercise(exerciseId: string): Promise<SocketResponse> {
        return new Promise<SocketResponse>((resolve) => {
            this.socket.emit('joinExercise', exerciseId, resolve);
        });
    }

    /**
     * Proposes an action to the server
     */
    private async sendAction(action: ExerciseAction) {
        const response = await new Promise<SocketResponse>((resolve) => {
            this.socket.emit('proposeAction', action, resolve);
        });
        return response;
    }
}
