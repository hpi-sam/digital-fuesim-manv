import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    IsOptional,
    MaxLength,
    ValidateNested,
    IsJSON,
    IsInt,
    MinLength,
} from 'class-validator';
import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import {
    UUID,
    uuidValidationOptions,
    ExerciseState,
} from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { Entity, Column, ManyToOne, IsNull } from 'typeorm';
import type { Creatable } from '../../database/dtos';
import type { ServiceProvider } from '../../database/services/service-provider';
import { ActionEmitter } from '../../exercise/action-emitter';
import { ActionWrapper } from '../../exercise/action-wrapper';
import { ExerciseWrapper } from '../../exercise/exercise-wrapper';
import { BaseEntity } from './base-entity';

@Entity()
export class ExerciseWrapperEntity extends BaseEntity<
    ExerciseWrapperEntity,
    ExerciseWrapper
> {
    async asNormal(
        services: ServiceProvider,
        entityManager?: EntityManager
    ): Promise<ExerciseWrapper> {
        const operations = async (manager: EntityManager) => {
            const actions = await services.actionWrapperService.findAll(
                {
                    where: {
                        emitter: {
                            exercise: {
                                id: this.id,
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
                this.participantId,
                this.trainerId,
                actionsInWrapper,
                services,
                JSON.parse(this.initialStateString) as ExerciseState,
                (
                    await services.actionEmitterService.findOne(
                        {
                            where: {
                                exercise: { id: this.id },
                                emitterName: IsNull(),
                            },
                        },
                        false,
                        manager
                    )
                )?.emitterId ?? undefined
            );
            normal.id = this.id;
            actionsInWrapper.splice(
                0,
                0,
                ...(await Promise.all(
                    actions.map(async (action) =>
                        action.asNormal(services, manager, normal)
                    )
                ))
            );
            normal.tickCounter = this.tickCounter;
            return normal;
        };
        return entityManager
            ? operations(entityManager)
            : services.transaction(operations);
    }

    @Column({
        type: 'integer',
        default: 0,
    })
    @IsInt()
    tickCounter = 0;

    @Column({
        type: 'json',
    })
    @IsJSON()
    initialStateString!: string;

    @Column({ type: 'char', length: 6 })
    @IsString()
    @MinLength(6)
    @MaxLength(6)
    participantId!: string;

    @Column({ type: 'char', length: 8 })
    @IsString()
    @MinLength(8)
    @MaxLength(8)
    trainerId!: string;

    /**
     * Be very careful when using this. - Use {@link create} instead for most use cases.
     * This constructor does not guarantee a valid entity.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    static async create(
        participantId: string,
        trainerId: string,
        services: ServiceProvider,
        initialState: ExerciseState = ExerciseState.create()
    ): Promise<ExerciseWrapperEntity> {
        const exercise = await services.exerciseWrapperService.create({
            participantId,
            trainerId,
            initialStateString: JSON.stringify(initialState),
        });

        return exercise;
    }
}

@Entity()
export class ActionEmitterEntity extends BaseEntity<
    ActionEmitterEntity,
    ActionEmitter
> {
    async asNormal(
        services: ServiceProvider,
        entityManager?: EntityManager,
        exercise?: ExerciseWrapper
    ): Promise<ActionEmitter> {
        const normal = new ActionEmitter(services);
        normal.emitterId = this.emitterId;
        normal.emitterName = this.emitterName;
        normal.exercise =
            exercise && exercise.id === this.exercise.id
                ? exercise
                : await this.exercise.asNormal(services);
        normal.id = this.id;
        return normal;
    }

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

    @ManyToOne(() => ExerciseWrapperEntity, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
        eager: true,
    })
    @ValidateNested()
    @Type(() => ExerciseWrapperEntity)
    exercise!: ExerciseWrapperEntity;
}

@Entity()
export class ActionWrapperEntity extends BaseEntity<
    ActionWrapperEntity,
    ActionWrapper
> {
    async asNormal(
        services: ServiceProvider,
        entityManager?: EntityManager,
        exercise?: ExerciseWrapper
    ): Promise<ActionWrapper> {
        const normal = new ActionWrapper(services);
        normal.action = JSON.parse(this.actionString);
        normal.emitter = await this.emitter.asNormal(
            services,
            entityManager,
            exercise
        );
        normal.id = this.id;
        return normal;
    }

    @ManyToOne(() => ActionEmitterEntity, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
        eager: true,
    })
    @ValidateNested()
    @Type(() => ActionEmitterEntity)
    emitter!: ActionEmitterEntity;

    @Column({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created!: Date;

    @Column({
        type: 'json',
    })
    @IsJSON()
    actionString!: string;

    /**
     * Be very careful when using this. - Use {@link create} instead for most use cases.
     * This constructor does not guarantee a valid entity.
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    static async create(
        action: ExerciseAction,
        emitter: Omit<Creatable<ActionEmitterEntity>, 'exerciseId'>,
        exerciseId: UUID,
        services: ServiceProvider,
        manager?: EntityManager
    ): Promise<ActionWrapperEntity> {
        return services.actionWrapperService.create(
            {
                actionString: JSON.stringify(action),
                emitter: { ...emitter, exerciseId },
            },
            manager
        );
    }
}
