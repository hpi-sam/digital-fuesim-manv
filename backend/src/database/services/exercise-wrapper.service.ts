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
    protected createSavableObject<
        TInitial extends ExerciseWrapperEntity | undefined
    >(
        initialObject: TInitial,
        dto: TInitial extends ExerciseWrapperEntity
            ? UpdateExerciseWrapper
            : CreateExerciseWrapper,
        manager: EntityManager
    ): ExerciseWrapperEntity | Promise<ExerciseWrapperEntity> {
        return initialObject
            ? manager.merge(this.entityTarget, initialObject, dto)
            : manager.create(this.entityTarget, dto);
    }
    protected readonly entityTarget = ExerciseWrapperEntity;
}
