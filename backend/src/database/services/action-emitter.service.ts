import type { DataSource, EntityManager } from 'typeorm';
import { ActionEmitter } from '../../exercise/exercise-wrapper';
import type { Creatable, Updatable } from '../dtos';
// import { ActionEmitter } from '../../exercise/action-emitter';
import { BaseService } from './base-service';
import type { ExerciseWrapperService } from './exercise-wrapper.service';

export class ActionEmitterService extends BaseService<ActionEmitter> {
    public constructor(
        private readonly exerciseService: ExerciseWrapperService,
        dataSource: DataSource
    ) {
        super(dataSource);
    }
    protected async createSavableObject<
        TInitial extends ActionEmitter | undefined
    >(
        initialObject: TInitial,
        dto: TInitial extends ActionEmitter
            ? Updatable<ActionEmitter>
            : Creatable<ActionEmitter>,
        manager: EntityManager
    ): Promise<ActionEmitter> {
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

    protected readonly entityTarget = ActionEmitter;
}
