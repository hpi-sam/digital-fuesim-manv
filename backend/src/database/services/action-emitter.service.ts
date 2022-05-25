import type { DataSource, EntityManager } from 'typeorm';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ActionEmitterEntity } from '../entities/action-emitter.entity';
import { BaseService } from './base-service';
import type { ExerciseWrapperService } from './exercise-wrapper.service';

export type CreateActionEmitter = Omit<
    ActionEmitterEntity,
    'exercise' | 'id'
> & {
    exerciseId: UUID;
};

type UpdateActionEmitter = Partial<CreateActionEmitter>;

/**
 * Provides the API to create, update, delete etc. {@link ActionEmitterEntity}s in the database
 */
export class ActionEmitterService extends BaseService<
    ActionEmitterEntity,
    CreateActionEmitter,
    UpdateActionEmitter
> {
    public constructor(
        private readonly exerciseService: ExerciseWrapperService,
        dataSource: DataSource
    ) {
        super(dataSource);
    }

    protected async getCreateEntityObject(
        dto: CreateActionEmitter,
        manager: EntityManager
    ): Promise<ActionEmitterEntity> {
        const { exerciseId, ...rest } = dto;
        const emitter = manager.create<ActionEmitterEntity>(
            this.entityTarget,
            rest
        );
        emitter.exercise = await this.exerciseService.findById(
            exerciseId,
            manager
        );
        return emitter;
    }

    protected async getUpdateEntityObject(
        initialObject: ActionEmitterEntity,
        dto: UpdateActionEmitter,
        manager: EntityManager
    ): Promise<ActionEmitterEntity> {
        const { exerciseId, ...rest } = dto;
        const emitter = manager.merge<ActionEmitterEntity>(
            this.entityTarget,
            initialObject,
            rest
        );
        emitter.exercise =
            exerciseId === undefined
                ? emitter.exercise
                : await this.exerciseService.findById(exerciseId!, manager);
        return emitter;
    }

    protected readonly entityTarget = ActionEmitterEntity;
}
