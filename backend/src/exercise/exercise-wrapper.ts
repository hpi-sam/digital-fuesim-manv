import type {
    ExerciseAction,
    ExerciseTimeline,
    Role,
    UUID,
    StateExport,
    ExerciseIds,
} from 'digital-fuesim-manv-shared';
import {
    ExerciseState,
    reduceExerciseState,
    validateExerciseState,
    validateExerciseAction,
} from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { LessThan } from 'typeorm';
import { IncrementIdGenerator } from '../utils/increment-id-generator';
import { ValidationErrorWrapper } from '../utils/validation-error-wrapper';
import { ExerciseWrapperEntity } from '../database/entities/exercise-wrapper.entity';
import { NormalType } from '../database/normal-type';
import type { DatabaseService } from '../database/services/database-service';
import { Config } from '../config';
import { RestoreError } from '../utils/restore-error';
import { UserReadableIdGenerator } from '../utils/user-readable-id-generator';
import type { ActionWrapperEntity } from '../database/entities/action-wrapper.entity';
import {
    migrateInDatabaseTo,
    migrateInMemoryTo,
} from '../database/state-migrations/migrations';
import { ActionWrapper } from './action-wrapper';
import type { ClientWrapper } from './client-wrapper';
import { exerciseMap } from './exercise-map';
import { patientTick } from './patient-ticking';
import { PeriodicEventHandler } from './periodic-events/periodic-event-handler';

export class ExerciseWrapper extends NormalType<
    ExerciseWrapper,
    ExerciseWrapperEntity
> {
    private _changedSinceSave = true;

    public get changedSinceSave() {
        return this._changedSinceSave;
    }

    /**
     * Mark this exercise as being up-to-date in the database
     */
    public markAsSaved() {
        this._changedSinceSave = false;
        this.temporaryActionHistory.splice(
            0,
            this.temporaryActionHistory.length
        );
    }

    /**
     * Mark this exercise as being out-of-date with the database representation
     */
    public markAsModified() {
        this._changedSinceSave = true;
    }

    async saveActions(
        entityManager: EntityManager,
        exerciseEntity: ExerciseWrapperEntity
    ): Promise<ActionWrapperEntity[]> {
        const entities = await Promise.all(
            this.temporaryActionHistory.map(async (action) =>
                action.asEntity(true, entityManager, exerciseEntity)
            )
        );
        this.temporaryActionHistory.splice(
            0,
            this.temporaryActionHistory.length
        );
        return entities;
    }

    async asEntity(
        save: boolean,
        entityManager?: EntityManager
    ): Promise<ExerciseWrapperEntity> {
        const operations = async (manager: EntityManager) => {
            const getFromDatabase = async () =>
                this.databaseService.exerciseWrapperService.getFindById(
                    this.id!
                )(manager);
            const getNew = () => ExerciseWrapperEntity.createNew();
            const copyData = async (entity: ExerciseWrapperEntity) => {
                entity.actions = await Promise.all(
                    this.temporaryActionHistory.map(async (action) =>
                        action.asEntity(false, manager, entity)
                    )
                );
                entity.initialStateString = JSON.stringify(this.initialState);
                entity.currentStateString = JSON.stringify(this.currentState);
                entity.participantId = this.participantId;
                entity.tickCounter = this.tickCounter;
                entity.trainerId = this.trainerId;
                entity.stateVersion = this.stateVersion;
            };
            const getDto = (entity: ExerciseWrapperEntity) => ({
                initialStateString: entity.initialStateString,
                currentStateString: entity.currentStateString,
                participantId: entity.participantId,
                tickCounter: entity.tickCounter,
                trainerId: entity.trainerId,
                stateVersion: entity.stateVersion,
            });
            const existed = this.id !== undefined;
            if (save && existed) {
                const entity = await getFromDatabase();
                entity.id = this.id!;
                await copyData(entity);

                const savedEntity =
                    await this.databaseService.exerciseWrapperService.getUpdate(
                        entity.id,
                        getDto(entity)
                    )(manager);
                this.id = savedEntity.id;
                await this.saveActions(manager, savedEntity);
                this.markAsSaved();
                return savedEntity;
            } else if (save && !existed) {
                const entity = getNew();
                await copyData(entity);

                const savedEntity =
                    await this.databaseService.exerciseWrapperService.getCreate(
                        getDto(entity)
                    )(manager);
                this.id = savedEntity.id;
                await this.saveActions(manager, savedEntity);
                this.markAsSaved();
                return savedEntity;
            } else if (!save && existed) {
                const entity = await getFromDatabase();
                entity.id = this.id!;
                await copyData(entity);

                return entity;
                // eslint-disable-next-line no-else-return
            } else {
                const entity = getNew();
                await copyData(entity);
                return entity;
            }
        };
        return entityManager
            ? operations(entityManager)
            : this.databaseService.transaction(operations);
    }

    // TODO: Method currently unused, kept for follow-up changes
    static createFromEntity(
        entity: ExerciseWrapperEntity,
        databaseService: DatabaseService
    ): ExerciseWrapper {
        const actionsInWrapper: ActionWrapper[] = [];
        const normal = new ExerciseWrapper(
            entity.participantId,
            entity.trainerId,
            actionsInWrapper,
            databaseService,
            entity.stateVersion,
            JSON.parse(entity.initialStateString) as ExerciseState,
            JSON.parse(entity.currentStateString) as ExerciseState
        );
        normal.id = entity.id;
        if (entity.actions) {
            actionsInWrapper.splice(
                0,
                0,
                ...entity.actions.map((action) =>
                    ActionWrapper.createFromEntity(
                        action,
                        databaseService,
                        normal
                    )
                )
            );
        }
        normal.tickCounter = entity.tickCounter;
        normal.markAsSaved();
        return normal;
    }

    tickCounter = 0;

    /**
     * The server always uses `null` as their emitter id.
     */
    private readonly emitterId = null;

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
            // TODO: Refactor this so that `refreshTreatments` is done the same way
            refreshTreatments:
                this.tickCounter % this.refreshTreatmentInterval === 0,
            tickInterval: this.tickInterval,
        };
        this.applyAction(updateAction, this.emitterId);
        this.tickCounter++;
        this.markAsModified();
    };

    // Call the tick every 1000 ms
    private readonly tickInterval = 1000;
    private readonly tickHandler = new PeriodicEventHandler(
        this.tick,
        this.tickInterval
    );

    private readonly clients = new Set<ClientWrapper>();

    public readonly incrementIdGenerator = new IncrementIdGenerator();

    /**
     * Be very careful when using this. - Use {@link create} instead for most use cases.
     * This constructor does not guarantee a valid entity.
     */
    constructor(
        public readonly participantId: string,
        public readonly trainerId: string,
        public readonly temporaryActionHistory: ActionWrapper[],
        databaseService: DatabaseService,
        private readonly stateVersion: number,
        private readonly initialState = ExerciseState.create(),
        private currentState: ExerciseState = initialState
    ) {
        super(databaseService);
    }

    /**
     * @param file A **valid** import file
     */
    static async importFromFile(
        databaseService: DatabaseService,
        file: StateExport,
        exerciseIds: ExerciseIds
    ): Promise<ExerciseWrapper> {
        const importOperations = async (manager: EntityManager | undefined) => {
            let exercise = new ExerciseWrapper(
                exerciseIds.participantId,
                exerciseIds.trainerId,
                [],
                databaseService,
                ExerciseState.currentStateVersion,
                file.history?.initialState ?? file.currentState,
                file.currentState
            );
            const actions = (file.history?.actionHistory ?? []).map(
                (action) =>
                    new ActionWrapper(
                        databaseService,
                        action,
                        exercise.emitterId,
                        exercise
                    )
            );
            exercise.temporaryActionHistory.push(...actions);
            if (manager === undefined) {
                // eslint-disable-next-line require-atomic-updates
                exercise = await migrateInMemoryTo(
                    ExerciseState.currentStateVersion,
                    exercise.stateVersion,
                    exercise
                );
            } else {
                const exerciseEntity = await exercise.save(manager);
                await migrateInDatabaseTo(
                    ExerciseState.currentStateVersion,
                    exercise.stateVersion,
                    exerciseEntity.id,
                    manager
                );
                // eslint-disable-next-line require-atomic-updates
                exercise = ExerciseWrapper.createFromEntity(
                    await databaseService.exerciseWrapperService.getFindById(
                        exerciseEntity.id
                    )(manager),
                    databaseService
                );
                // Reset actions to apply them (they are removed when saving the entity to the database)
                exercise.temporaryActionHistory.push(...actions);
            }
            exercise.restore();
            exercise.applyAction(
                {
                    type: '[Exercise] Set Participant Id',
                    participantId: exerciseIds.participantId,
                },
                exercise.emitterId,
                undefined
            );
            exercise.tickCounter = actions.filter(
                (action) => action.action.type === '[Exercise] Tick'
            ).length;
            if (manager !== undefined) {
                await exercise.save(manager);
            }
            return exercise;
        };
        return Config.useDb
            ? databaseService.transaction(importOperations)
            : importOperations(undefined);
    }

    static create(
        participantId: string,
        trainerId: string,
        databaseService: DatabaseService,
        initialState: ExerciseState = ExerciseState.create()
    ): ExerciseWrapper {
        const exercise = new ExerciseWrapper(
            participantId,
            trainerId,
            [],
            databaseService,
            ExerciseState.currentStateVersion,
            initialState
        );

        exercise.applyAction(
            {
                type: '[Exercise] Set Participant Id',
                participantId,
            },
            exercise.emitterId
        );

        return exercise;
    }

    private restore(): void {
        if (this.stateVersion !== ExerciseState.currentStateVersion) {
            throw new RestoreError(
                `The exercise was created with an incompatible version of the state (got version ${this.stateVersion}, required version ${ExerciseState.currentStateVersion})`,
                this.id!
            );
        }
        this.validateInitialState();
        this.restoreState();
    }

    private restoreState() {
        this.currentState = this.initialState;
        this.temporaryActionHistory.forEach((action) => {
            this.validateAction(action.action);
            const state = reduceExerciseState(this.currentState, action.action);
            this.currentState = state;
        });
        this.incrementIdGenerator.setCurrent(
            this.temporaryActionHistory.length
        );
        // Remove all actions to not save them again (if database is active)
        if (Config.useDb) {
            this.temporaryActionHistory.splice(
                0,
                this.temporaryActionHistory.length
            );
        }
        // Pause exercise
        if (this.currentState.statusHistory.at(-1)?.status === 'running')
            this.reduce(
                {
                    type: '[Exercise] Pause',
                    timestamp: Date.now(),
                },
                this.emitterId
            );
        // Remove all clients from state
        Object.values(this.currentState.clients).forEach((client) => {
            const removeClientAction: ExerciseAction = {
                type: '[Client] Remove client',
                clientId: client.id,
            };
            this.reduce(removeClientAction, this.emitterId);
        });
    }

    static async restoreAllExercises(
        databaseService: DatabaseService
    ): Promise<ExerciseWrapper[]> {
        return databaseService.transaction(async (manager) => {
            const outdatedExercises =
                await databaseService.exerciseWrapperService.getFindAll({
                    where: {
                        stateVersion: LessThan(
                            ExerciseState.currentStateVersion
                        ),
                    },
                })(manager);
            outdatedExercises.forEach(async (exercise) => {
                await migrateInDatabaseTo(
                    ExerciseState.currentStateVersion,
                    exercise.stateVersion,
                    exercise.id,
                    manager
                );
            });

            const exercises = await Promise.all(
                (
                    await databaseService.exerciseWrapperService.getFindAll()(
                        manager
                    )
                ).map(async (exerciseEntity) => {
                    const exercise = ExerciseWrapper.createFromEntity(
                        exerciseEntity,
                        databaseService
                    );
                    // Load all actions
                    exercise.temporaryActionHistory.splice(
                        0,
                        exercise.temporaryActionHistory.length,
                        ...(
                            await databaseService.actionWrapperService.getFindAll(
                                {
                                    where: { exercise: { id: exercise.id } },
                                    order: { index: 'ASC' },
                                }
                            )(manager)
                        ).map((actionEntity) =>
                            ActionWrapper.createFromEntity(
                                actionEntity,
                                databaseService,
                                exercise
                            )
                        )
                    );
                    return exercise;
                })
            );
            await Promise.all(
                exercises.map(async (exercise) => exercise.restore())
            );
            exercises.forEach((exercise) => {
                exerciseMap.set(exercise.participantId, exercise);
                exerciseMap.set(exercise.trainerId, exercise);
            });
            UserReadableIdGenerator.lock([...exerciseMap.keys()]);
            return exercises;
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
    private emitAction(action: ExerciseAction) {
        this.clients.forEach((client) => client.emitAction(action));
    }

    public addClient(clientWrapper: ClientWrapper) {
        if (clientWrapper.client === undefined) {
            return;
        }
        const client = clientWrapper.client;
        const addClientAction: ExerciseAction = {
            type: '[Client] Add client',
            client,
        };
        this.applyAction(addClientAction, client.id);
        // Only after all this add the client in order to not send the action adding itself to it
        this.clients.add(clientWrapper);
    }

    public removeClient(clientWrapper: ClientWrapper) {
        if (!this.clients.has(clientWrapper)) {
            // clientWrapper not part of this exercise
            return;
        }
        const client = clientWrapper.client!;
        const removeClientAction: ExerciseAction = {
            type: '[Client] Remove client',
            clientId: client.id,
        };
        this.applyAction(removeClientAction, client.id, () => {
            clientWrapper.disconnect();
            this.clients.delete(clientWrapper);
        });
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
    public applyAction(
        action: ExerciseAction,
        emitterId: UUID | null,
        intermediateAction?: () => void
    ): void {
        this.reduce(action, emitterId);
        intermediateAction?.();
        this.emitAction(action);
    }

    /**
     * Applies the action on the current state.
     * @throws Error if the action is not applicable on the current state
     */
    private reduce(action: ExerciseAction, emitterId: UUID | null): void {
        this.validateAction(action);
        const newState = reduceExerciseState(this.currentState, action);
        this.setState(newState, action, emitterId);
        if (action.type === '[Exercise] Pause') {
            this.pause();
        } else if (action.type === '[Exercise] Start') {
            this.start();
        }
    }

    private validateInitialState() {
        const errors = validateExerciseState(this.initialState);
        if (errors.length > 0) {
            throw new ValidationErrorWrapper(errors);
        }
    }

    private validateAction(action: ExerciseAction) {
        const errors = validateExerciseAction(action);
        if (errors.length > 0) {
            throw new ValidationErrorWrapper(errors);
        }
    }

    private setState(
        newExerciseState: ExerciseState,
        action: ExerciseAction,
        emitterId: UUID | null
    ): void {
        this.currentState = newExerciseState;
        this.temporaryActionHistory.push(
            new ActionWrapper(this.databaseService, action, emitterId, this)
        );
        this.markAsModified();
    }

    public async deleteExercise() {
        this.clients.forEach((client) => client.disconnect());
        // Pause the exercise to stop the tick
        this.pause();
        exerciseMap.delete(this.participantId);
        exerciseMap.delete(this.trainerId);
        if (this.id !== undefined && Config.useDb) {
            await this.databaseService.transaction(
                this.databaseService.exerciseWrapperService.getRemove(this.id)
            );
            this.markAsSaved();
        }
    }

    public async getTimeLine(): Promise<ExerciseTimeline> {
        const completeHistory = [
            ...(this.id !== undefined && Config.useDb
                ? await this.databaseService.transaction(
                      this.databaseService.actionWrapperService.getFindAll({
                          where: { exercise: { id: this.id } },
                      })
                  )
                : []
            ).map((action) =>
                ActionWrapper.createFromEntity(
                    action,
                    this.databaseService,
                    this
                )
            ),
            ...this.temporaryActionHistory,
        ]
            // TODO: Is this necessary?
            .sort((a, b) => a.index - b.index);
        return {
            initialState: this.initialState,
            actionsWrappers: completeHistory.map((action) => ({
                action: action.action,
                emitterId: action.emitterId,
                time: action.index,
            })),
        };
    }
}
