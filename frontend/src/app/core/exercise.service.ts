import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    ExerciseAction,
    ExerciseState,
    SocketResponse,
    UUID,
} from 'digital-fuesim-manv-shared';
import { socketIoTransports } from 'digital-fuesim-manv-shared';
import { freeze } from 'immer';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { NotificationService } from '../pages/exercises/exercise/core/notification.service';
import type { AppState } from '../state/app.state';
import {
    setExerciseState,
    applyServerAction,
    joinExercise,
    leaveExercise,
} from '../state/application/application.actions';
import { selectExerciseStateMode } from '../state/application/selectors/application.selectors';
import { selectExerciseState } from '../state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from '../state/get-state-snapshot';
import { websocketOrigin } from './api-origins';
import { MessageService } from './messages/message.service';
import { OptimisticActionHandler } from './optimistic-action-handler';

@Injectable({
    providedIn: 'root',
})
export class ExerciseService {
    private readonly socket: Socket<
        ServerToClientEvents,
        ClientToServerEvents
    > = io(websocketOrigin, {
        ...socketIoTransports,
    });

    private readonly optimisticActionHandler = new OptimisticActionHandler<
        ExerciseAction,
        ExerciseState,
        SocketResponse
    >(
        (exercise) => this.store.dispatch(setExerciseState(exercise)),
        () => selectStateSnapshot(selectExerciseState, this.store),
        (action) => this.store.dispatch(applyServerAction(action)),
        async (action) => {
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
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService,
        private readonly notificationService: NotificationService
    ) {
        this.socket.on('performAction', (action: ExerciseAction) => {
            freeze(action, true);
            this.optimisticActionHandler.performAction(action);
        });
        this.socket.on('disconnect', (reason) => {
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
     * Use the function in ApplicationService instead
     *
     * Join an exercise and retrieve its state
     * Displays an error message if the join failed
     * @returns whether the join was successful
     */
    public async joinExercise(
        exerciseId: string,
        clientName: string
    ): Promise<boolean> {
        this.socket.connect().on('connect_error', (error) => {
            this.messageService.postError({
                title: 'Fehler beim Verbinden zum Server',
                error,
            });
        });
        const joinResponse = await new Promise<SocketResponse<UUID>>(
            (resolve) => {
                this.socket.emit(
                    'joinExercise',
                    exerciseId,
                    clientName,
                    resolve
                );
            }
        );
        if (!joinResponse.success) {
            this.messageService.postError({
                title: 'Fehler beim Beitreten der Übung',
                error: joinResponse.message,
            });
            return false;
        }
        const getStateResponse = await new Promise<
            SocketResponse<ExerciseState>
        >((resolve) => {
            this.socket.emit('getState', resolve);
        });
        freeze(getStateResponse, true);
        if (!getStateResponse.success) {
            this.messageService.postError({
                title: 'Fehler beim Laden der Übung',
                error: getStateResponse.message,
            });
            return false;
        }
        this.store.dispatch(
            joinExercise(
                joinResponse.payload,
                getStateResponse.payload,
                exerciseId,
                clientName
            )
        );
        // Only start them after the correct state is in the store
        this.notificationService.startNotifications();
        return true;
    }

    /**
     * Use the function in ApplicationService instead
     */
    public leaveExercise() {
        this.socket.disconnect();
        this.notificationService.stopNotifications();
        this.store.dispatch(leaveExercise());
    }

    /**
     *
     * @param optimistic wether the action should be applied before the server responds (to reduce latency) (this update is guaranteed to be synchronous)
     * @returns the response of the server
     */
    public async proposeAction(action: ExerciseAction, optimistic = false) {
        if (
            selectStateSnapshot(selectExerciseStateMode, this.store) !==
            'exercise'
        ) {
            // Especially during timeTravel, buttons that propose actions are only deactivated via best effort
            this.messageService.postError({
                title: 'Änderungen konnten nicht vorgenommen werden',
                body: 'Treten Sie der Übung wieder bei.',
            });
            return { success: false };
        }
        // TODO: throw if `response.success` is false
        return this.optimisticActionHandler.proposeAction(action, optimistic);
    }
}
