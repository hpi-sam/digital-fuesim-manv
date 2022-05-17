import type { EntityManager } from 'typeorm';
import { ExerciseWrapperEntity } from '../entities/exercise-wrapper.entity';
import { BaseService } from './base-service';

type CreateExerciseWrapper = Omit<
    ExerciseWrapperEntity,
    'id' | 'tickCounter'
> & {
    tickCounter?: number;
};

type UpdateExerciseWrapper = Partial<CreateExerciseWrapper>;

export class ExerciseWrapperService extends BaseService<
    ExerciseWrapperEntity,
    CreateExerciseWrapper,
    UpdateExerciseWrapper
> {
    protected getCreateEntityObject(
        dto: CreateExerciseWrapper,
        manager: EntityManager
    ): ExerciseWrapperEntity | Promise<ExerciseWrapperEntity> {
        return manager.create<ExerciseWrapperEntity>(this.entityTarget, dto);
    }

    protected getUpdateEntityObject(
        initialObject: ExerciseWrapperEntity,
        dto: UpdateExerciseWrapper,
        manager: EntityManager
    ): ExerciseWrapperEntity | Promise<ExerciseWrapperEntity> {
        return manager.merge<ExerciseWrapperEntity>(
            this.entityTarget,
            initialObject,
            dto
        );
    }

    protected readonly entityTarget = ExerciseWrapperEntity;
}
