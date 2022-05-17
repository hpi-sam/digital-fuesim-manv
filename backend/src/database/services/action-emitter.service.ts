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

    protected async createSavableObject<
        TInitial extends ActionEmitterEntity | undefined
    >(
        initialObject: TInitial,
        dto: TInitial extends ActionEmitterEntity
            ? UpdateActionEmitter
            : CreateActionEmitter,
        manager: EntityManager
    ): Promise<ActionEmitterEntity> {
        const { exerciseId, ...rest } = dto;
        const emitter = initialObject
            ? manager.merge(this.entityTarget, initialObject, rest)
            : manager.create(this.entityTarget, rest);
        emitter.exercise =
            initialObject && exerciseId === undefined
                ? emitter.exercise
                : await this.exerciseService.findById(exerciseId!, manager);
        return emitter;
    }

    protected readonly entityTarget = ActionEmitterEntity;
}
