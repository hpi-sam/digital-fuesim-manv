import type { ExerciseAction, Role } from 'digital-fuesim-manv-shared';
import { reduceExerciseState, ExerciseState } from 'digital-fuesim-manv-shared';
import type { ClientWrapper } from './client-wrapper';
import { exerciseMap } from './exercise-map';
import { patientTick } from './patient-ticking';
import { PeriodicEventHandler } from './periodic-events/periodic-event-handler';

export class ExerciseWrapper {
    private tickCounter = 0;

    /**
     * How many ticks have to pass until treatments get recalculated (e.g. with {@link tickInterval} === 1000 and {@link refreshTreatmentInterval} === 60 every minute)
     */
    private readonly refreshTreatmentInterval = 20;
    /**
     * This function gets called once every second in case the exercise is running.
     * All periodic actions of the exercise (e.g. status changes for patients) should happen here.
     */
    private readonly tick = async () => {
        const patientUpdates = patientTick(
            this.getStateSnapshot(),
            this.tickInterval
        );
        const updateAction: ExerciseAction = {
            type: '[Exercise] Tick',
            patientUpdates,
            /**
             * refresh every {@link refreshTreatmentInterval} * {@link tickInterval} ms seconds
             */
            refreshTreatments:
                this.tickCounter % this.refreshTreatmentInterval === 0,
        };
        this.reduce(updateAction);
        this.emitAction(updateAction);
        this.tickCounter++;
    };

    // Call the tick every 1000 ms
    private readonly tickInterval = 1000;
    private readonly tickHandler = new PeriodicEventHandler(
        this.tick,
        this.tickInterval
    );

    private readonly clients = new Set<ClientWrapper>();

    private currentState = ExerciseState.create();

    private readonly stateHistory: ExerciseState[] = [];

    constructor(
        private readonly participantId: string,
        private readonly trainerId: string
    ) {
        this.reduce({
            type: '[Exercise] Set Participant Id',
            participantId,
        });
    }

    /**
     * Select the role that is applied when using the given id.
     * @param id The id the client used.
     * @returns The role of the client, determined by the id.
     * @throws {@link RangeError} in case the provided {@link id} is not part of this exercise.
     */
    public getRoleFromUsedId(id: string): Role {
        switch (id) {
            case this.participantId:
                return 'participant';
            case this.trainerId:
                return 'trainer';
            default:
                throw new RangeError(
                    `Incorrect id: ${id} where pid=${this.participantId} and tid=${this.trainerId}`
                );
        }
    }

    public getStateSnapshot(): ExerciseState {
        return this.currentState;
    }

    // TODO: To more generic function
    public emitAction(action: ExerciseAction) {
        this.clients.forEach((client) => client.emitAction(action));
    }

    public addClient(clientWrapper: ClientWrapper) {
        if (clientWrapper.client === undefined) {
            return;
        }
        const addClientAction: ExerciseAction = {
            type: '[Client] Add client',
            client: clientWrapper.client,
        };
        this.reduce(addClientAction);
        this.emitAction(addClientAction);
        // Only after all this add the client in order to not send the action adding itself to it
        this.clients.add(clientWrapper);
    }

    public removeClient(clientWrapper: ClientWrapper) {
        if (!this.clients.has(clientWrapper)) {
            // clientWrapper not part of this exercise
            return;
        }
        const removeClientAction: ExerciseAction = {
            type: '[Client] Remove client',
            clientId: clientWrapper.client!.id,
        };
        this.reduce(removeClientAction);
        this.clients.delete(clientWrapper);
        this.emitAction(removeClientAction);
    }

    public start() {
        this.tickHandler.start();
    }

    public pause() {
        this.tickHandler.pause();
    }

    /**
     * Applies the action on the current state.
     * @throws Error if the action is not applicable on the current state
     */
    public reduce(action: ExerciseAction): void {
        const newState = reduceExerciseState(this.currentState, action);
        this.setState(newState);
        if (action.type === '[Exercise] Pause') {
            this.pause();
        } else if (action.type === '[Exercise] Start') {
            this.start();
        }
    }

    private setState(newExerciseState: ExerciseState): void {
        this.stateHistory.push(this.currentState);
        this.currentState = newExerciseState;
    }

    public deleteExercise() {
        this.clients.forEach((client) => client.disconnect());
        exerciseMap.delete(this.participantId);
        exerciseMap.delete(this.trainerId);
    }
}
