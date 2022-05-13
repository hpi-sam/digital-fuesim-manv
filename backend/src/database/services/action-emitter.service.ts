import type { DataSource, EntityManager } from 'typeorm';
import { ActionEmitterEntity } from '../entities/all-entities';
// import { ActionEmitterEntity } from '../entities/action-emitter.entity';
import type { Creatable, Updatable } from '../dtos';
import { BaseService } from './base-service';
import type { ExerciseWrapperService } from './exercise-wrapper.service';

export class ActionEmitterService extends BaseService<ActionEmitterEntity> {
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
            ? Updatable<ActionEmitterEntity>
            : Creatable<ActionEmitterEntity>,
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
