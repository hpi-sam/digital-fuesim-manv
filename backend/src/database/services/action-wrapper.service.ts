import type { EntityManager, DataSource } from 'typeorm';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { Creatable, Updatable } from '../dtos';
import { ActionWrapper } from '../../exercise/action-wrapper';
// import type { ActionEmitter } from '../../exercise/action-emitter';
import type { ActionEmitter } from '../../exercise/exercise-wrapper';
import type { ActionEmitterService } from './action-emitter.service';
import { BaseService } from './base-service';

export class ActionWrapperService extends BaseService<ActionWrapper> {
    public constructor(
        private readonly actionEmitterService: ActionEmitterService,
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
        const { emitter: actionEmitter, ...rest } = dto;
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
        return actionWrapper;
    }

    protected readonly entityTarget = ActionWrapper;
}
