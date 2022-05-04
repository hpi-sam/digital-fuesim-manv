import type { EntityManager, DataSource } from 'typeorm';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { Creatable, Updatable } from '../dtos';
// import { ActionWrapper } from '../../exercise/action-wrapper';
import type { ActionEmitter } from '../../exercise/action-emitter';
import { ActionWrapper } from '../../exercise/exercise-wrapper';
import type { ActionEmitterService } from './action-emitter.service';
import { BaseService } from './base-service';
import type { ExerciseWrapperService } from './exercise-wrapper.service';

export class ActionWrapperService extends BaseService<ActionWrapper> {
    public constructor(
        private readonly actionEmitterService: ActionEmitterService,
        private readonly exerciseWrapperService: ExerciseWrapperService,
        dataSource: DataSource
    ) {
        super(dataSource);
    }

    protected async createSavableObject<
        TInitial extends ActionWrapper | undefined
    >(
        initialObject: TInitial,
        dto: TInitial extends ActionWrapper
            ? Updatable<ActionWrapper>
            : Creatable<ActionWrapper>,
        manager: EntityManager
    ): Promise<ActionWrapper> {
        const { emitter: actionEmitter, exerciseId, ...rest } = dto;
        const actionWrapper = initialObject
            ? manager.merge(this.entityTarget, initialObject, rest)
            : manager.create(this.entityTarget, rest);
        actionWrapper.emitter = initialObject
            ? actionEmitter
                ? await this.actionEmitterService.findOne(
                      { where: { id: actionEmitter as UUID } },
                      true,
                      manager
                  )
                : actionWrapper.emitter
            : await this.actionEmitterService.findOneOrCreate(
                  {
                      where: {
                          emitterId: (actionEmitter as Creatable<ActionEmitter>)
                              .emitterId,
                      },
                  },
                  actionEmitter as Creatable<ActionEmitter>,
                  manager
              );
        actionWrapper.exercise = exerciseId
            ? await this.exerciseWrapperService.findById(exerciseId, manager)
            : actionWrapper.exercise;
        return actionWrapper;
    }

    protected readonly entityTarget = ActionWrapper;
}
