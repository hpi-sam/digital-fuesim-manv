import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Action } from '@ngrx/store';
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
import {
    applyAction,
    reduceExerciseState,
    socketIoTransports,
} from 'digital-fuesim-manv-shared';
import produce from 'immer';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, lastValueFrom, map } from 'rxjs';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { AppState } from '../state/app.state';
import {
    applyServerAction,
    setExerciseState,
} from '../state/exercise/exercise.actions';
import { getSelectClient } from '../state/exercise/exercise.selectors';
import { getStateSnapshot } from '../state/get-state-snapshot';
import { httpOrigin, websocketOrigin } from './api-origins';
import { MessageService } from './messages/message.service';
import { OptimisticActionHandler } from './optimistic-action-handler';

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
        this.setOwnClientId(undefined);
    }

    private _ownClientId?: UUID;
    private setOwnClientId(ownClientId: UUID | undefined) {
        this._ownClientId = ownClientId;
        this.ownClientId$.next(this.ownClientId);
    }

    /**
     * The id of the client that is currently joined to the exercise with {@link exerciseId}
     * undefined: the client is not joined to an exercise
     * null: {@link isTimeTraveling} is true, the client could not be in the current exercise state
     */
    public get ownClientId() {
        if (this.isTimeTraveling) {
            return null;
        }
        return this._ownClientId;
    }

    public readonly ownClientId$ = new BehaviorSubject(this.ownClientId);
    public readonly ownClient$ = this.ownClientId$.pipe(
        map((clientId) =>
            clientId
                ? getSelectClient(clientId)(getStateSnapshot(this.store))
                : undefined
        )
    );

    /**
     * Emits the currentRole
     */
    public get currentRole() {
        return this.ownClientId
            ? getSelectClient(this.ownClientId)(getStateSnapshot(this.store))
                  .role
            : 'timeTravel';
    }

    private _exerciseId?: UUID;

    /**
     * Either the trainer or participant id
     */
    public get exerciseId() {
        return this._exerciseId;
    }

    /**
     * Whether the client is currently joined to an exercise
     */
    public get isJoined() {
        return this._ownClientId !== undefined;
    }

    private currentState?: ExerciseState;
    private readonly actionsQueue: Action[] = [];
    private readonly optimisticActionHandler = new OptimisticActionHandler<
        ExerciseAction,
        ExerciseState,
        SocketResponse
    >(
        // TODO: Make this right
        (exercise) =>
            this.isTimeTraveling
                ? (this.currentState = exercise)
                : this.store.dispatch(setExerciseState(exercise)),
        () =>
            this.isTimeTraveling
                ? this.currentState!
                : getStateSnapshot(this.store).exercise,
        (action) => {
            if (!this.isTimeTraveling) {
                this.store.dispatch(applyServerAction(action));
                return;
            }
            this.actionsQueue.push(action);
            this.currentState = reduceExerciseState(this.currentState!, action);
        },
        // sendAction needs access to this.socket
        async (action) => this.sendAction(action)
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly httpClient: HttpClient,
        private readonly messageService: MessageService
    ) {
        this.socket.on('performAction', (action: ExerciseAction) => {
            // TODO: Remove this
            this.tempTimelineActionWrappers.push({
                action,
                time: Date.now(),
            });
            this.optimisticActionHandler.performAction(action);
        });
        this.socket.on('disconnect', (reason) => {
            this.setOwnClientId(undefined);
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
        this.setOwnClientId(joinExercise.payload);
        this._exerciseId = exerciseId;
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
        if (this.isTimeTraveling) {
            this.messageService.postError({
                title: 'Die Vergangenheit kann nicht bearbeitet werden',
                body: 'Deaktiviere den Zeitreise Modus, um Änderungen vorzunehmen.',
            });
            return { success: false };
        }
        // TODO: throw if `response.success` is false
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
        // TODO: remove this
        this.tempTimelineInitialState = response.payload;
        this.store.dispatch(setExerciseState(response.payload));
        return response;
    }

    /**
     * Wether the user is currently in the time travel mode instead of the present state of the exercise.
     */
    public get isTimeTraveling() {
        return this._isTimeTraveling;
    }

    private _isTimeTraveling = false;
    public isTimeTraveling$ = new BehaviorSubject(this._isTimeTraveling);

    /**
     * Emits the currentRole
     */
    // TODO: We currently expect the store to always be updated when the role changes
    public currentRole$: Observable<this['currentRole']> = combineLatest<any>([
        this.ownClientId$,
        this.isTimeTraveling$,
    ]).pipe(map(() => this.currentRole));

    public async toggleTimeTravel() {
        if (this._isTimeTraveling) {
            this.timeConstraints = undefined;
            this.currentExerciseTime = undefined;
            this._isTimeTraveling = false;
            this.isTimeTraveling$.next(false);
            this.store.dispatch(setExerciseState(this.currentState!));
            // TODO: set the state back to the current one
        } else {
            this.currentState = getStateSnapshot(this.store).exercise;
            this.currentExerciseTime = this.currentState.currentTime;
            const { initialState } = await this.getExerciseTimeline();
            this.timeConstraints = {
                start: initialState.currentTime,
                // TODO:
                end: getStateSnapshot(this.store).exercise.currentTime,
            };
            this._isTimeTraveling = true;
            this.isTimeTraveling$.next(true);
        }
        // Depends on isTimeTraveling
        this.ownClientId$.next(this.ownClientId);
    }

    public timeConstraints?: {
        start: number;
        end: number;
    };

    public currentExerciseTime?: number;

    public async jumpToTime(exerciseTime: number): Promise<void> {
        console.log('jumpToTime', exerciseTime);

        const { initialState, actionsWrappers } =
            await this.getExerciseTimeline();
        // Apply all the actions
        // TODO: Maybe do this in a WebWorker?
        // TODO: Maybe cache already calculated states to improve performance when jumping on the timeline
        const stateAtTime = produce(initialState, (draftState) => {
            for (const { action } of actionsWrappers) {
                applyAction(draftState, action);
                // TODO: We actually want the last action after which currentTime <= exerciseTime
                // Maybe look wether the action is a tick action and if so, check how much time would go by
                if (draftState.currentTime > exerciseTime) {
                    break;
                }
            }
        });

        // Update the exercise store with the state
        this.store.dispatch(setExerciseState(stateAtTime));
    }

    private tempTimelineInitialState?: ExerciseState;
    private readonly tempTimelineActionWrappers: ExerciseTimeline['actionsWrappers'] =
        [];
    private exerciseTimeline?: ExerciseTimeline;
    private async getExerciseTimeline(
        forceRefresh = false
    ): Promise<ExerciseTimeline> {
        if (!this.exerciseTimeline || forceRefresh) {
            // TODO: get from server
            this.exerciseTimeline = {
                initialState: this.tempTimelineInitialState!,
                actionsWrappers: this.tempTimelineActionWrappers,
            };
        }
        return this.exerciseTimeline;
    }

    /**
     * These functions are independent from the rest
     *
     */

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
}

export interface ExerciseTimeline {
    initialState: ExerciseState;
    actionsWrappers: {
        action: ExerciseAction;
        time: number;
    }[];
}
