import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsJSON, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { ServiceProvider } from '../database/services/service-provider';
import type { Creatable } from '../database/dtos';
import { BaseEntity } from '../database/base-entity';
import type { ExerciseWrapper } from './exercise-wrapper';
import { ActionEmitter } from './exercise-wrapper';

@Entity()
export class ActionWrapper extends BaseEntity {
    @ManyToOne(() => ActionEmitter, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
        eager: true,
    })
    @ValidateNested()
    @Type(() => ActionEmitter)
    emitter!: ActionEmitter;

    @Column({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created!: Date;

    get action(): ExerciseAction {
        return JSON.parse(this.actionString);
    }

    @Column({
        type: 'json',
    })
    @IsJSON()
    actionString!: string;

    /** Exists to prevent creation via it. - Use {@link create} instead. */
    private constructor() {
        super();
    }

    static async create(
        action: ExerciseAction,
        emitter: Omit<Creatable<ActionEmitter>, 'exerciseId'>,
        exercise: ExerciseWrapper,
        services: ServiceProvider
    ): Promise<ActionWrapper> {
        return services.actionWrapperService.create({
            actionString: JSON.stringify(action),
            emitter: { ...emitter, exerciseId: exercise.id },
        });
    }
}
