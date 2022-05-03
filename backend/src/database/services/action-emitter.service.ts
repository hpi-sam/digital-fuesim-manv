import type { EntityManager } from 'typeorm';
import type { Creatable, Updatable } from '../dtos';
import { ActionEmitter } from '../../exercise/action-emitter';
import { BaseService } from './base-service';

export class ActionEmitterService extends BaseService<ActionEmitter> {
    protected createSavableObject<TInitial extends ActionEmitter | undefined>(
        initialObject: TInitial,
        dto: TInitial extends ActionEmitter
            ? Updatable<ActionEmitter>
            : Creatable<ActionEmitter>,
        manager: EntityManager
    ): ActionEmitter {
        return initialObject
            ? manager.merge(this.entityTarget, initialObject, dto)
            : manager.create(this.entityTarget, dto);
    }

    protected readonly entityTarget = ActionEmitter;
}
