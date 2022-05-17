import type { EntityManager } from 'typeorm';
import { ExerciseWrapperEntity } from '../entities/exercise-wrapper.entity';
import type { Creatable, Updatable } from '../dtos';
import { BaseService } from './base-service';

export class ExerciseWrapperService extends BaseService<ExerciseWrapperEntity> {
    protected createSavableObject<
        TInitial extends ExerciseWrapperEntity | undefined
    >(
        initialObject: TInitial,
        dto: TInitial extends ExerciseWrapperEntity
            ? Updatable<ExerciseWrapperEntity>
            : Creatable<ExerciseWrapperEntity>,
        manager: EntityManager
    ): ExerciseWrapperEntity | Promise<ExerciseWrapperEntity> {
        return initialObject
            ? manager.merge(this.entityTarget, initialObject, dto)
            : manager.create(this.entityTarget, dto);
    }
    protected readonly entityTarget = ExerciseWrapperEntity;
}
