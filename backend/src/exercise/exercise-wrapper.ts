// TODO: See action-emitter.ts (@Dassderdie)

/* eslint-disable @typescript-eslint/no-duplicate-imports */
/* eslint-disable import/order */
import {
    uuidValidationOptions,
    UUID,
    uuid,
    validateExerciseAction,
} from 'digital-fuesim-manv-shared';
import { reduceExerciseState, ExerciseState } from 'digital-fuesim-manv-shared';
import { Column, Entity } from 'typeorm';
import {
    IsInt,
    IsJSON,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';
import type { ServiceProvider } from '../database/services/service-provider';
import type { Creatable } from '../database/dtos';
import { BaseEntity } from '../database/base-entity';
// import { ActionEmitter } from './action-emitter';
import { ActionWrapper } from './action-wrapper';
import type { ClientWrapper } from './client-wrapper';
import { exerciseMap } from './exercise-map';
import { patientTick } from './patient-ticking';
import { PeriodicEventHandler } from './periodic-events/periodic-event-handler';

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ManyToOne } from 'typeorm';

import { IsOptional } from 'class-validator';
import type { ExerciseAction, Role } from 'digital-fuesim-manv-shared';
import { ValidationErrorWrapper } from '../utils/validation-error-wrapper';

@Entity()
export class ExerciseWrapper extends BaseEntity {
    @Column({
        type: 'integer',
        default: 0,
    })
    @IsInt()
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
        await this.services.exerciseWrapperService.update(this.id, {
            tickCounter: this.tickCounter,
        });
    };

    // Call the tick every 1000 ms
    private readonly tickInterval = 1000;
    private readonly tickHandler = new PeriodicEventHandler(
        this.tick,
        this.tickInterval
    );

    private readonly clients = new Set<ClientWrapper>();

    private readonly initialState = ExerciseState.create();

    @Column({
        type: 'json',
    })
    @IsJSON()
    readonly initialStateString = JSON.stringify(this.initialState);

    private currentState = this.initialState;

    /**
     * This only contains some snapshots of the state, not every state in between.
     */
    private readonly stateHistory: ExerciseState[] = [];

    private readonly actionHistory: ActionWrapper[] = [];

    @Column({ type: 'char', length: 6 })
    @IsString()
    @MinLength(6)
    @MaxLength(6)
    readonly participantId!: string;

    @Column({ type: 'char', length: 8 })
    @IsString()
    @MinLength(8)
    @MaxLength(8)
    readonly trainerId!: string;

    private services!: ServiceProvider;

    /** Exists to prevent creation via it. - Use {@link create} instead. */
    private constructor() {
        super();
    }

    static async create(
        participantId: string,
        trainerId: string,
        services: ServiceProvider,
        initialState: ExerciseState = ExerciseState.create()
    ): Promise<ExerciseWrapper> {
        const exercise = await services.exerciseWrapperService.create({
            participantId,
            trainerId,
            initialStateString: JSON.stringify(initialState),
        });

        exercise.services = services;

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
        emitter: Omit<Creatable<ActionEmitter>, 'exerciseId'>,
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
        emitter: Omit<Creatable<ActionEmitter>, 'exerciseId'>
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
        emitter: Omit<Creatable<ActionEmitter>, 'exerciseId'>
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
        await this.services.exerciseWrapperService.remove(this.id);
    }
}

@Entity()
export class ActionEmitter extends BaseEntity {
    @Column({ type: 'uuid', unique: true })
    @IsUUID(4, uuidValidationOptions)
    emitterId!: UUID;

    /**
     * `undefined` iff this emitter is the server
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    emitterName?: string;

    @ManyToOne(() => ExerciseWrapper, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
        eager: true,
    })
    @ValidateNested()
    @Type(() => ExerciseWrapper)
    exercise!: ExerciseWrapper;
}
