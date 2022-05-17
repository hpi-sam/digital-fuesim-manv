import type { EntityManager, DataSource } from 'typeorm';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ActionWrapperEntity } from '../entities/action-wrapper.entity';
import type {
    ActionEmitterService,
    CreateActionEmitter,
} from './action-emitter.service';
import { BaseService } from './base-service';

type CreateActionWrapper = Omit<
    ActionWrapperEntity,
    'created' | 'emitter' | 'id'
> & {
    emitter: CreateActionEmitter;
};

type UpdateActionWrapper = Omit<Partial<CreateActionWrapper>, 'emitter'> & {
    emitter?: UUID;
};

export class ActionWrapperService extends BaseService<
    ActionWrapperEntity,
    CreateActionWrapper,
    UpdateActionWrapper
> {
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
            ? UpdateActionWrapper
            : CreateActionWrapper,
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
                          emitterId: (actionEmitter as CreateActionEmitter)
                              .emitterId,
                      },
                  },
                  actionEmitter as CreateActionEmitter,
                  manager
              );
        return actionWrapper;
    }

    protected readonly entityTarget = ActionWrapperEntity;
}
