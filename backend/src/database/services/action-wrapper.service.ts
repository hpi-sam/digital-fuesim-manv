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

    protected async getCreateEntityObject(
        dto: CreateActionWrapper,
        manager: EntityManager
    ): Promise<ActionWrapperEntity> {
        const { emitter: actionEmitter, ...rest } = dto;
        const actionWrapper = manager.create<ActionWrapperEntity>(
            this.entityTarget,
            rest
        );
        actionWrapper.emitter = await this.actionEmitterService.findOneOrCreate(
            {
                where: {
                    emitterId: actionEmitter.emitterId,
                },
            },
            actionEmitter as CreateActionEmitter,
            manager
        );
        return actionWrapper;
    }

    protected async getUpdateEntityObject(
        initialObject: ActionWrapperEntity,
        dto: UpdateActionWrapper,
        manager: EntityManager
    ): Promise<ActionWrapperEntity> {
        const { emitter: actionEmitter, ...rest } = dto;
        const actionWrapper = manager.merge<ActionWrapperEntity>(
            this.entityTarget,
            initialObject,
            rest
        );
        actionWrapper.emitter = actionEmitter
            ? await this.actionEmitterService.findOne(
                  { where: { id: actionEmitter as UUID } },
                  true,
                  manager
              )
            : actionWrapper.emitter;
        return actionWrapper;
    }

    protected readonly entityTarget = ActionWrapperEntity;
}
