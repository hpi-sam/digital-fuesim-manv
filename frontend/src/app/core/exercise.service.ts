import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ClientToServerEvents,
    ExerciseAction,
    ExerciseState,
    ServerToClientEvents,
    SocketResponse,
    UUID,
} from 'digital-fuesim-manv-shared';
import { socketIoTransports } from 'digital-fuesim-manv-shared';
import { freeze } from 'immer';
import { filter, pairwise, Subject, switchMap, takeUntil } from 'rxjs';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { handleChanges } from '../shared/functions/handle-changes';
import type { AppState } from '../state/app.state';
import {
    createApplyServerActionAction,
    createJoinExerciseAction,
    createLeaveExerciseAction,
    createSetExerciseStateAction,
} from '../state/application/application.actions';
import { selectExerciseStateMode } from '../state/application/selectors/application.selectors';
import {
    selectClients,
    selectExerciseState,
} from '../state/application/selectors/exercise.selectors';
import {
    selectCurrentRole,
    selectOwnClient,
    selectVisibleVehicles,
} from '../state/application/selectors/shared.selectors';
import { selectStateSnapshot } from '../state/get-state-snapshot';
import { websocketOrigin } from './api-origins';
import { MessageService } from './messages/message.service';
import { OptimisticActionHandler } from './optimistic-action-handler';

/**
 * This Service deals with the state synchronization of a live exercise.
 * In addition, it notifies the user during an exercise of certain events (new client connected, vehicle arrived etc.).
 *
 * While this service should be used for proposing all actions (= changing the state) all
 * read operations should be done via the central frontend store (with the help of selectors).
 */
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

    private optimisticActionHandler?: OptimisticActionHandler<
        ExerciseAction,
        ExerciseState,
        SocketResponse
    >;

    constructor(
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService
    ) {
        this.socket.on('performAction', (action: ExerciseAction) => {
            freeze(action, true);
            this.optimisticActionHandler?.performAction(action);
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
            createJoinExerciseAction(
                joinResponse.payload,
                getStateResponse.payload,
                exerciseId,
                clientName
            )
        );
        // Only do this after the correct state is in the store
        this.optimisticActionHandler = new OptimisticActionHandler<
            ExerciseAction,
            ExerciseState,
            SocketResponse
        >(
            (exercise) =>
                this.store.dispatch(createSetExerciseStateAction(exercise)),
            () => selectStateSnapshot(selectExerciseState, this.store),
            (action) =>
                this.store.dispatch(createApplyServerActionAction(action)),
            async (action) => {
                const response = await new Promise<SocketResponse>(
                    (resolve) => {
                        this.socket.emit('proposeAction', action, resolve);
                    }
                );
                if (!response.success) {
                    this.messageService.postError({
                        title: 'Fehler beim Senden der Aktion',
                        error: response.message,
                    });
                }
                return response;
            }
        );
        this.startNotifications();
        return true;
    }

    /**
     * Use the function in ApplicationService instead
     */
    public leaveExercise() {
        this.socket.disconnect();
        this.stopNotifications();
        this.optimisticActionHandler = undefined;
        this.store.dispatch(createLeaveExerciseAction());
    }

    /**
     *
     * @param optimistic wether the action should be applied before the server responds (to reduce latency) (this update is guaranteed to be synchronous)
     * @returns the response of the server
     */
    public async proposeAction(action: ExerciseAction, optimistic = false) {
        if (
            selectStateSnapshot(selectExerciseStateMode, this.store) !==
                'exercise' ||
            this.optimisticActionHandler === undefined
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

    private readonly stopNotifications$ = new Subject<void>();

    private startNotifications() {
        // If the user is a trainer, display a message for each joined or disconnected client
        this.store
            .select(selectCurrentRole)
            .pipe(
                filter((role) => role === 'trainer'),
                switchMap(() => this.store.select(selectClients)),
                pairwise(),
                takeUntil(this.stopNotifications$)
            )
            .subscribe(([oldClients, newClients]) => {
                handleChanges(oldClients, newClients, {
                    createHandler: (newClient) => {
                        this.messageService.postMessage({
                            title: `${newClient.name} ist als ${
                                newClient.role === 'trainer'
                                    ? 'Trainer'
                                    : 'Teilnehmer'
                            } beigetreten.`,
                            color: 'info',
                        });
                    },
                    deleteHandler: (oldClient) => {
                        this.messageService.postMessage({
                            title: `${oldClient.name} hat die Übung verlassen.`,
                            color: 'info',
                        });
                    },
                });
            });
        // If the user is restricted to a viewport, display a message for each vehicle that arrived at this viewport
        this.store
            .select(selectOwnClient)
            .pipe(
                filter(
                    (client) =>
                        client?.viewRestrictedToViewportId !== undefined &&
                        !client.isInWaitingRoom
                ),
                switchMap((client) => this.store.select(selectVisibleVehicles)),
                pairwise(),
                takeUntil(this.stopNotifications$)
            )
            .subscribe(([oldVehicles, newVehicles]) => {
                handleChanges(oldVehicles, newVehicles, {
                    createHandler: (newVehicle) => {
                        this.messageService.postMessage({
                            title: `${newVehicle.name} ist eingetroffen.`,
                            color: 'info',
                        });
                    },
                });
            });
    }

    private stopNotifications() {
        this.stopNotifications$.next();
    }
}
