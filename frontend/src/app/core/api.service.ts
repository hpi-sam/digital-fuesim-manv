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
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import type { AppState } from '../state/app.state';
import {
    applyServerAction,
    setExerciseState,
} from '../state/exercise/exercise.actions';
import { getStateSnapshot } from '../state/get-state-snapshot';
import { OptimisticActionHandler } from './optimistic-action-handler';
import { httpOrigin, websocketOrigin } from './api-origins';
import { MessageService } from './messages/message.service';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private _socket?: Socket<ServerToClientEvents, ClientToServerEvents>;

    private get socket() {
        if (!this._socket) {
            this._socket = io(websocketOrigin, {
                ...socketIoTransports,
            });
        }
        return this._socket;
    }

    /**
     * Connect (or reconnect) the socket
     */
    private connectSocket() {
        this.socket.connect().on('connect_error', (error) => {
            this.messageService.postError({
                title: 'Fehler beim Verbinden zum Server',
                error,
            });
        });
    }

    /**
     * Disconnect the socket
     */
    private disconnectSocket() {
        this.socket.disconnect();
    }

    /**
     * Leave the current exercise
     */
    public leaveExercise() {
        this.disconnectSocket();
        this._ownClientId = undefined;
    }

    private _ownClientId?: UUID;

    public get ownClientId() {
        return this._ownClientId;
    }

    /**
     * Whether the client is currently joined to an exercise
     */
    public get isJoined() {
        return this._ownClientId !== undefined;
    }

    private readonly optimisticActionHandler = new OptimisticActionHandler<
        ExerciseAction,
        ExerciseState,
        SocketResponse
    >(
        (exercise) => this.store.dispatch(setExerciseState(exercise)),
        () => getStateSnapshot(this.store).exercise,
        (action) => this.store.dispatch(applyServerAction(action)),
        // sendAction needs access to this.socket
        async (action) => this.sendAction(action)
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly httpClient: HttpClient,
        private readonly messageService: MessageService
    ) {
        this.socket.on('performAction', (action: ExerciseAction) => {
            this.optimisticActionHandler.performAction(action);
        });
        this.socket.on('disconnect', (reason) => {
            this._ownClientId = undefined;
            if (reason === 'io client disconnect') {
                return;
            }
            this.messageService.postError(
                {
                    title: 'Die Verbindung zum Server wurde unterbrochen',
                    body: 'Laden Sie die Seite neu, um die Verbindung wieder herzustellen.',
                    error: reason,
                },
                'alert',
                null
            );
        });
    }

    /**
     * Join an exercise and retrieve its state
     * Displays an error message if the join failed
     * @returns wether the join was successful
     */
    public async joinExercise(
        exerciseId: string,
        clientName: string
    ): Promise<boolean> {
        this.connectSocket();
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
            this.messageService.postError({
                title: 'Fehler beim Beitreten der Übung',
                error: joinExercise.message,
            });
            return false;
        }
        const stateSynchronized = await this.synchronizeState();
        if (!stateSynchronized.success) {
            return false;
        }
        this._ownClientId = joinExercise.payload;
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
        if (!response.success) {
            this.messageService.postError({
                title: 'Fehler beim Senden der Aktion',
                error: response.message,
            });
        }
        return response;
    }

    private async synchronizeState() {
        const response = await new Promise<SocketResponse<ExerciseState>>(
            (resolve) => {
                this.socket.emit('getState', resolve);
            }
        );
        if (!response.success) {
            this.messageService.postError({
                title: 'Fehler beim Laden der Übung',
                error: response.message,
            });
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

    /**
     * @param exerciseId the trainerId or participantId of the exercise
     * @returns wether the exercise exists
     */
    public async exerciseExists(exerciseId: string) {
        return lastValueFrom(
            this.httpClient.get<null>(
                `${httpOrigin}/api/exercise/${exerciseId}`
            )
        )
            .then(() => true)
            .catch((error) => {
                if (error.status !== 404) {
                    this.messageService.postError({
                        title: 'Interner Fehler',
                        error,
                    });
                }
                return false;
            });
    }

    /**
     * Call a {@link url} and return its status
     * @param url The URL to call
     * @returns The status of the call to {@link url}
     */
    public async callUrl(url: string) {
        const response = await fetch(url);
        return response.status;
    }
}
