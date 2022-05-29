import type { EntityManager, DataSource } from 'typeorm';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ActionWrapperEntity } from '../entities/action-wrapper.entity';
import { BaseService } from './base-service';
import type { ExerciseWrapperService } from './exercise-wrapper.service';

type CreateActionWrapper = Omit<ActionWrapperEntity, 'exercise' | 'id'> & {
    exerciseId: UUID;
};

type UpdateActionWrapper = Partial<CreateActionWrapper>;

/**
 * Provides the API to create, update, delete etc. {@link ActionWrapperEntity}s in the database
 */
export class ActionWrapperService extends BaseService<
    ActionWrapperEntity,
    CreateActionWrapper,
    UpdateActionWrapper
> {
    public constructor(
        private readonly exerciseWrapperService: ExerciseWrapperService,
        dataSource: DataSource
    ) {
        super(dataSource);
    }

    protected async getCreateEntityObject(
        dto: CreateActionWrapper,
        manager: EntityManager
    ): Promise<ActionWrapperEntity> {
        const { exerciseId, ...rest } = dto;
        const actionWrapper = manager.create<ActionWrapperEntity>(
            this.entityTarget,
            rest
        );
        actionWrapper.exercise = await this.exerciseWrapperService.getFindById(
            exerciseId
        )(manager);
        return actionWrapper;
    }

    protected async getUpdateEntityObject(
        initialObject: ActionWrapperEntity,
        dto: UpdateActionWrapper,
        manager: EntityManager
    ): Promise<ActionWrapperEntity> {
        const { exerciseId, ...rest } = dto;
        const actionWrapper = manager.merge<ActionWrapperEntity>(
            this.entityTarget,
            initialObject,
            rest
        );
        actionWrapper.exercise = exerciseId
            ? await this.exerciseWrapperService.getFindById(exerciseId)(manager)
            : actionWrapper.exercise;
        return actionWrapper;
    }

    protected readonly entityTarget = ActionWrapperEntity;
}
