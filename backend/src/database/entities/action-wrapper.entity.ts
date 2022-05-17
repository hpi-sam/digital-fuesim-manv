import { Type } from 'class-transformer';
import { ValidateNested, IsJSON } from 'class-validator';
import type { CreateActionEmitter } from 'database/services/action-emitter.service';
import type { ServiceProvider } from 'database/services/service-provider';
import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import type { ActionWrapper } from 'exercise/action-wrapper';
import type { EntityManager } from 'typeorm';
import { Entity, ManyToOne, Column } from 'typeorm';
import { ActionEmitterEntity } from './action-emitter.entity';
import { BaseEntity } from './base-entity';

@Entity()
export class ActionWrapperEntity extends BaseEntity<
    ActionWrapperEntity,
    ActionWrapper
> {
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
        emitter: CreateActionEmitter,
        services: ServiceProvider,
        manager?: EntityManager
    ): Promise<ActionWrapperEntity> {
        return services.actionWrapperService.create(
            {
                actionString: JSON.stringify(action),
                emitter,
            },
            manager
        );
    }
}
