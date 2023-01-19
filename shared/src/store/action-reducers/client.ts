import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Client } from '../../models';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils/get-element';

export class AddClientAction implements Action {
    @IsValue('[Client] Add client' as const)
    public readonly type = '[Client] Add client';
    @ValidateNested()
    @Type(() => Client)
    public readonly client!: Client;
}

export class RemoveClientAction implements Action {
    @IsValue('[Client] Remove client' as const)
    public readonly type = '[Client] Remove client';
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
}

export class RestrictViewToViewportAction implements Action {
    @IsValue('[Client] Restrict to viewport' as const)
    public readonly type = '[Client] Restrict to viewport';
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public readonly viewportId?: UUID;
}

export class SetWaitingRoomAction implements Action {
    @IsValue('[Client] Set waitingroom' as const)
    public readonly type = '[Client] Set waitingroom';
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
    @IsBoolean()
    public readonly shouldBeInWaitingRoom!: boolean;
}

export namespace ClientActionReducers {
    export const addClient: ActionReducer<AddClientAction> = {
        action: AddClientAction,
        reducer: (draftState, { client }) => {
            draftState.clients[client.id] = cloneDeepMutable(client);
            return draftState;
        },
        rights: 'server',
    };

    export const removeClient: ActionReducer<RemoveClientAction> = {
        action: RemoveClientAction,
        reducer: (draftState, { clientId }) => {
            getElement(draftState, 'client', clientId);
            delete draftState.clients[clientId];
            return draftState;
        },
        rights: 'server',
    };

    export const restrictViewToViewport: ActionReducer<RestrictViewToViewportAction> =
        {
            action: RestrictViewToViewportAction,
            reducer: (draftState, { clientId, viewportId }) => {
                const client = getElement(draftState, 'client', clientId);
                if (viewportId === undefined) {
                    client.viewRestrictedToViewportId = viewportId;
                    return draftState;
                }
                getElement(draftState, 'viewport', viewportId);
                client.viewRestrictedToViewportId = viewportId;
                return draftState;
            },
            rights: 'trainer',
        };

    export const setWaitingRoom: ActionReducer<SetWaitingRoomAction> = {
        action: SetWaitingRoomAction,
        reducer: (draftState, { clientId, shouldBeInWaitingRoom }) => {
            const client = getElement(draftState, 'client', clientId);
            client.isInWaitingRoom = shouldBeInWaitingRoom;
            return draftState;
        },
        rights: 'trainer',
    };
}
