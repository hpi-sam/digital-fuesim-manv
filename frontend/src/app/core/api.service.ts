import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ClientToServerEvents,
    ExerciseAction,
    ExerciseIds,
    ExerciseState,
    ServerToClientEvents,
    SocketResponse,
    UUID,
} from 'digital-fuesim-manv-shared';
import { socketIoTransports } from 'digital-fuesim-manv-shared';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { BehaviorSubject, first, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import type { AppState } from '../state/app.state';
import {
    applyServerAction,
    setExerciseState,
} from '../state/exercise/exercise.actions';
import { OptimisticActionHandler } from './optimistic-action-handler';
import { httpOrigin, websocketOrigin } from './api-origins';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly socket: Socket<
        ServerToClientEvents,
        ClientToServerEvents
    > = io(websocketOrigin, {
        ...socketIoTransports,
    });

    /**
     * Reconnect the socket.
     */
    public reconnect() {
        this.socket.connect();
    }

    private _ownClientId?: UUID;

    public get ownClientId() {
        return this._ownClientId;
    }

    private readonly optimisticActionHandler = new OptimisticActionHandler<
        ExerciseAction,
        ExerciseState,
        SocketResponse
    >(
        (exercise) => this.store.dispatch(setExerciseState(exercise)),
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
        (action) => this.store.dispatch(applyServerAction(action)),
        // sendAction needs access to this.socket
        async (action) => this.sendAction(action)
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly httpClient: HttpClient
    ) {
        this.socket.on('performAction', (action: ExerciseAction) => {
            this.optimisticActionHandler.performAction(action);
        });
    }

    public hasJoinedExerciseState$ = new BehaviorSubject<
        'joined' | 'joining' | 'not-joined'
    >('not-joined');

    /**
     * Join an exercise and retrieve its state
     * @returns wether the join was successful
     */
    public async joinExercise(
        exerciseId: string,
        clientName: string
    ): Promise<boolean> {
        this.hasJoinedExerciseState$.next('joining');
        const joinExercise = await new Promise<SocketResponse<UUID>>(
            (resolve) => {
                this.socket.emit(
                    'joinExercise',
                    exerciseId,
                    clientName,
                    resolve
                );
            }
        );
        if (!joinExercise.success) {
            this.hasJoinedExerciseState$.next('not-joined');
            return false;
        }
        const stateSynchronized = await this.synchronizeState();
        if (!stateSynchronized.success) {
            this.hasJoinedExerciseState$.next('not-joined');
            return false;
        }
        this._ownClientId = joinExercise.payload;
        this.hasJoinedExerciseState$.next('joined');
        return true;
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
        const response = await new Promise<SocketResponse<ExerciseState>>(
            (resolve) => {
                this.socket.emit('getState', resolve);
            }
        );
        if (!response.success) {
            return response;
        }
        this.store.dispatch(setExerciseState(response.payload));
        return response;
    }

    public async createExercise() {
        return lastValueFrom(
            this.httpClient.post<ExerciseIds>(`${httpOrigin}/api/exercise`, {})
        );
    }

    public async deleteExercise(trainerId: string) {
        return lastValueFrom(
            this.httpClient.delete<undefined>(
                `${httpOrigin}/api/exercise/${trainerId}`,
                {}
            )
        );
    }
}
