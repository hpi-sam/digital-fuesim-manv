import type { EntityManager, DataSource } from 'typeorm';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { Creatable, Updatable } from '../dtos';
// import { ActionWrapperEntity } from '../entities/action-wrapper.entity';
// import type { ActionEmitterEntity } from '../entities/action-emitter.entity';
import type { ActionEmitterEntity } from '../entities/all-entities';
import { ActionWrapperEntity } from '../entities/all-entities';
import type { ActionEmitterService } from './action-emitter.service';
import { BaseService } from './base-service';

export class ActionWrapperService extends BaseService<ActionWrapperEntity> {
    public constructor(
        private readonly actionEmitterService: ActionEmitterService,
        dataSource: DataSource
    ) {
        super(dataSource);
    }

    protected async createSavableObject<
        TInitial extends ActionWrapperEntity | undefined
    >(
        initialObject: TInitial,
        dto: TInitial extends ActionWrapperEntity
            ? Updatable<ActionWrapperEntity>
            : Creatable<ActionWrapperEntity>,
        manager: EntityManager
    ): Promise<ActionWrapperEntity> {
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
                          emitterId: (
                              actionEmitter as Creatable<ActionEmitterEntity>
                          ).emitterId,
                      },
                  },
                  actionEmitter as Creatable<ActionEmitterEntity>,
                  manager
              );
        return actionWrapper;
    }

    protected readonly entityTarget = ActionWrapperEntity;
}
