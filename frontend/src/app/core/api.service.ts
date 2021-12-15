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
import { AppAction } from '../state/app.actions';

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
            this.store.dispatch<AppAction>({
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
        (action) => this.store.dispatch<AppAction>(action),
        // sendAction needs access to this.socket
        (action) => this.sendAction(action)
    );

    constructor(private readonly store: Store<AppState>) {
        this.socket.on('connect', () => {
            console.log('Socket connected', this.socket.id);
        });
        this.socket.on('disconnect', () => {
            console.log('Socket disconnected', this.socket.id);
        });
        this.socket.on('performAction', (action: ExerciseAction) => {
            this.optimisticActionHandler.performAction(action);
        });
    }

    /**
     * Join an exercise and retrieve its state
     */
    public async joinExercise(exerciseId: string) {
        const joinExercise = await new Promise<SocketResponse>((resolve) => {
            this.socket.emit('joinExercise', exerciseId, resolve);
        });
        if (!joinExercise.success) {
            return false;
        }
        return this.synchronizeState();
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

    /**
     * Proposes an action to the server
     */
    private async sendAction(action: ExerciseAction) {
        const response = await new Promise<SocketResponse>((resolve) => {
            this.socket.emit('proposeAction', action, resolve);
        });
        return response;
    }

    private async synchronizeState() {
        // TODO: check which actions have to be applied
        const response = await new Promise<SocketResponse<ExerciseState>>(
            (resolve) => this.socket.emit('getState', resolve)
        );
        if (!response.success) {
            return response;
        }
        this.store.dispatch<AppAction>({
            type: '[Exercise] Set state',
            exercise: response.payload,
        });
        return response;
    }
}
