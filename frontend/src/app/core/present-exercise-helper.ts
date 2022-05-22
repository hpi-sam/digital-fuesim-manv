import type {
    ClientToServerEvents,
    ExerciseAction,
    ExerciseState,
    ServerToClientEvents,
    SocketResponse,
    UUID,
} from 'digital-fuesim-manv-shared';
import { socketIoTransports } from 'digital-fuesim-manv-shared';
import { BehaviorSubject } from 'rxjs';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { websocketOrigin } from './api-origins';
import type { MessageService } from './messages/message.service';
import { OptimisticActionHandler } from './optimistic-action-handler';
import { addAction, setInitialState } from './temp-timeline';

export class PresentExerciseHelper {
    private _socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
    private get socket() {
        if (!this._socket) {
            this._socket = io(websocketOrigin, {
                ...socketIoTransports,
            });
        }
        return this._socket;
    }

    private _exerciseId?: UUID;
    /**
     * Either the trainer or participant id
     */
    public get exerciseId() {
        return this._exerciseId;
    }

    public ownClientId?: UUID;
    public readonly ownClientId$ = new BehaviorSubject(this.ownClientId);
    private setOwnClientId(ownClientId: UUID | undefined) {
        this.ownClientId = ownClientId;
        this.ownClientId$.next(this.ownClientId);
    }

    private readonly optimisticActionHandler = new OptimisticActionHandler<
        ExerciseAction,
        ExerciseState,
        SocketResponse
    >(
        this.setExerciseState,
        this.getExerciseState,
        this.applyAction,
        // sendAction needs access to this.socket
        async (action) => this.sendAction(action)
    );

    public readonly proposeAction =
        this.optimisticActionHandler.proposeAction.bind(
            this.optimisticActionHandler
        );

    constructor(
        private readonly setExerciseState: (state: ExerciseState) => void,
        private readonly getExerciseState: () => ExerciseState,
        private readonly applyAction: (action: ExerciseAction) => void,
        private readonly messageService: MessageService
    ) {
        this.socket.on('performAction', (action: ExerciseAction) => {
            // TODO: Remove this
            addAction(action);
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
        // TODO: Remove this
        setInitialState(response.payload);
        this.setExerciseState(response.payload);
        return response;
    }
}
