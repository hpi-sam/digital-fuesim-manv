import type { ExerciseAction, Role, UUID } from 'digital-fuesim-manv-shared';
import {
    uuid,
    ExerciseState,
    reduceExerciseState,
    validateExerciseAction,
} from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { IsNull } from 'typeorm';
import { ValidationErrorWrapper } from '../utils/validation-error-wrapper';
import type { Creatable, Updatable } from '../database/dtos';
import type { ActionEmitterEntity } from '../database/entities/action-emitter.entity';
import { ExerciseWrapperEntity } from '../database/entities/exercise-wrapper.entity';
import { NormalType } from '../database/normal-type';
import type { ServiceProvider } from '../database/services/service-provider';
import { ActionWrapper } from './action-wrapper';
import type { ClientWrapper } from './client-wrapper';
import { exerciseMap } from './exercise-map';
import { patientTick } from './patient-ticking';
import { PeriodicEventHandler } from './periodic-events/periodic-event-handler';

export class ExerciseWrapper extends NormalType<
    ExerciseWrapper,
    ExerciseWrapperEntity
> {
    async asEntity(
        save: boolean,
        entityManager?: EntityManager
    ): Promise<ExerciseWrapperEntity> {
        const operations = async (manager: EntityManager) => {
            let entity = this.id
                ? await this.services.exerciseWrapperService.findById(
                      this.id,
                      manager
                  )
                : new ExerciseWrapperEntity();
            const existed = this.id !== undefined;
            if (this.id) entity.id = this.id;
            entity.initialStateString = JSON.stringify(this.initialState);
            entity.participantId = this.participantId;
            entity.tickCounter = this.tickCounter;
            entity.trainerId = this.trainerId;

            if (save) {
                if (existed) {
                    const updatable: Updatable<ExerciseWrapperEntity> = {
                        initialStateString: entity.initialStateString,
                        participantId: entity.participantId,
                        tickCounter: entity.tickCounter,
                        trainerId: entity.trainerId,
                    };
                    entity = await this.services.exerciseWrapperService.update(
                        entity.id,
                        updatable,
                        manager
                    );
                } else {
                    const creatable: Creatable<ExerciseWrapperEntity> = {
                        initialStateString: entity.initialStateString,
                        participantId: entity.participantId,
                        tickCounter: entity.tickCounter,
                        trainerId: entity.trainerId,
                    };
                    entity = await this.services.exerciseWrapperService.create(
                        creatable,
                        manager
                    );
                }
                this.id = entity.id;
            }

            return entity;
        };
        return entityManager
            ? operations(entityManager)
            : this.services.transaction(operations);
    }

    static async createFromEntity(
        entity: ExerciseWrapperEntity,
        services: ServiceProvider,
        entityManager?: EntityManager
    ): Promise<ExerciseWrapper> {
        const operations = async (manager: EntityManager) => {
            const actions = await services.actionWrapperService.findAll(
                {
                    where: {
                        emitter: {
                            exercise: {
                                id: entity.id,
                            },
                        },
                    },
                    order: {
                        created: 'ASC',
                    },
                },
                manager
            );
            const actionsInWrapper: ActionWrapper[] = [];
            const normal = new ExerciseWrapper(
                entity.participantId,
                entity.trainerId,
                actionsInWrapper,
                services,
                JSON.parse(entity.initialStateString) as ExerciseState,
                (
                    await services.actionEmitterService.findOne(
                        {
                            where: {
                                exercise: { id: entity.id },
                                emitterName: IsNull(),
                            },
                        },
                        false,
                        manager
                    )
                )?.emitterId ?? undefined
            );
            normal.id = entity.id;
            actionsInWrapper.splice(
                0,
                0,
                ...(await Promise.all(
                    actions.map(async (action) =>
                        ActionWrapper.createFromEntity(
                            action,
                            services,
                            manager,
                            normal
                        )
                    )
                ))
            );
            normal.tickCounter = entity.tickCounter;
            return normal;
        };
        return entityManager
            ? operations(entityManager)
            : services.transaction(operations);
    }

    tickCounter = 0;

    /**
     * The uuid used in the ActionEmitters for Actions proposed by the server for this exercise.
     */
    private readonly emitterUUID = uuid();

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
            tickInterval: this.tickInterval,
        };
        await this.applyAction(updateAction, { emitterId: this.emitterUUID });
        this.tickCounter++;
        await this.save();
    };

    // Call the tick every 1000 ms
    private readonly tickInterval = 1000;
    private readonly tickHandler = new PeriodicEventHandler(
        this.tick,
        this.tickInterval
    );

    private readonly clients = new Set<ClientWrapper>();

    private currentState = this.initialState;

    /**
     * This only contains some snapshots of the state, not every state in between.
     */
    private readonly stateHistory: ExerciseState[] = [];

    private readonly actionHistory: ActionWrapper[] = [];

    /**
     * Be very careful when using this. - Use {@link create} instead for most use cases.
     * This constructor does not guarantee a valid entity.
     */
    constructor(
        public readonly participantId: string,
        public readonly trainerId: string,
        actions: ActionWrapper[],
        services: ServiceProvider,
        private readonly initialState = ExerciseState.create(),
        emitterUUID: UUID | undefined = undefined
    ) {
        super(services);
        this.actionHistory = actions;
        this.emitterUUID = emitterUUID ?? this.emitterUUID;
    }

    static async create(
        participantId: string,
        trainerId: string,
        services: ServiceProvider,
        initialState: ExerciseState = ExerciseState.create()
    ): Promise<ExerciseWrapper> {
        const exercise = new ExerciseWrapper(
            participantId,
            trainerId,
            [],
            services,
            initialState
        );
        await exercise.save();

        await exercise.applyAction(
            {
                type: '[Exercise] Set Participant Id',
                participantId,
            },
            { emitterId: exercise.emitterUUID }
        );

        return exercise;
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
    private emitAction(action: ExerciseAction) {
        this.clients.forEach((client) => client.emitAction(action));
    }

    public async addClient(clientWrapper: ClientWrapper) {
        if (clientWrapper.client === undefined) {
            return;
        }
        const client = clientWrapper.client;
        const addClientAction: ExerciseAction = {
            type: '[Client] Add client',
            client,
        };
        await this.applyAction(addClientAction, {
            emitterId: client.id,
            emitterName: client.name,
        });
        // Only after all this add the client in order to not send the action adding itself to it
        this.clients.add(clientWrapper);
    }

    public async removeClient(clientWrapper: ClientWrapper) {
        if (!this.clients.has(clientWrapper)) {
            // clientWrapper not part of this exercise
            return;
        }
        const client = clientWrapper.client!;
        const removeClientAction: ExerciseAction = {
            type: '[Client] Remove client',
            clientId: client.id,
        };
        await this.applyAction(
            removeClientAction,
            {
                emitterId: client.id,
                emitterName: client.name,
            },
            () => {
                clientWrapper.disconnect();
                this.clients.delete(clientWrapper);
            }
        );
    }

    public start() {
        this.tickHandler.start();
    }

    public pause() {
        this.tickHandler.pause();
    }

    /**
     * Applies and broadcasts the action on the current state.
     * @param intermediateAction When set is run between reducing the state and broadcasting the action
     * @throws Error if the action is not applicable on the current state
     */
    public async applyAction(
        action: ExerciseAction,
        emitter: Omit<Creatable<ActionEmitterEntity>, 'exerciseId'>,
        intermediateAction?: () => void
    ): Promise<void> {
        await this.reduce(action, emitter);
        intermediateAction?.();
        this.emitAction(action);
    }

    /**
     * Applies the action on the current state.
     * @throws Error if the action is not applicable on the current state
     */
    private async reduce(
        action: ExerciseAction,
        emitter: Omit<Creatable<ActionEmitterEntity>, 'exerciseId'>
    ): Promise<void> {
        this.validateAction(action);
        const newState = reduceExerciseState(this.currentState, action);
        await this.setState(newState, action, emitter);
        if (action.type === '[Exercise] Pause') {
            this.pause();
        } else if (action.type === '[Exercise] Start') {
            this.start();
        }
    }

    private validateAction(action: ExerciseAction) {
        const errors = validateExerciseAction(action);
        if (errors.length > 0) {
            throw new ValidationErrorWrapper(errors);
        }
    }

    private async setState(
        newExerciseState: ExerciseState,
        action: ExerciseAction,
        emitter: Omit<Creatable<ActionEmitterEntity>, 'exerciseId'>
    ): Promise<void> {
        // Only save every tenth state directly
        // TODO: Check whether this is a good threshold.
        if (this.actionHistory.length % 10 === 0) {
            this.stateHistory.push(this.currentState);
        }
        this.currentState = newExerciseState;
        this.actionHistory.push(
            await ActionWrapper.create(action, emitter, this, this.services)
        );
    }

    public async deleteExercise() {
        this.clients.forEach((client) => client.disconnect());
        exerciseMap.delete(this.participantId);
        exerciseMap.delete(this.trainerId);
        if (this.id) await this.services.exerciseWrapperService.remove(this.id);
    }
}
