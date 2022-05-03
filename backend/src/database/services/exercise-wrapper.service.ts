import type { EntityManager } from 'typeorm';
import type { Creatable, Updatable } from '../dtos';
import { ExerciseWrapper } from '../../exercise/exercise-wrapper';
import { BaseService } from './base-service';

export class ExerciseWrapperService extends BaseService<ExerciseWrapper> {
    protected createSavableObject<TInitial extends ExerciseWrapper | undefined>(
        initialObject: TInitial,
        dto: TInitial extends ExerciseWrapper
            ? Updatable<ExerciseWrapper>
            : Creatable<ExerciseWrapper>,
        manager: EntityManager
    ): ExerciseWrapper | Promise<ExerciseWrapper> {
        return initialObject
            ? manager.merge(this.entityTarget, initialObject, dto)
            : manager.create(this.entityTarget, dto);
    }
    protected readonly entityTarget = ExerciseWrapper;
}
