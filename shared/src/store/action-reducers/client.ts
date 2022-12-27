import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Client } from '../../models';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils/get-element';

export class AddClientAction implements Action {
    @IsLiteralUnion({ '[Client] Add client': true })
    public readonly type = '[Client] Add client';
    @ValidateNested()
    @Type(() => Client)
    public readonly client!: Client;
}

export class RemoveClientAction implements Action {
    @IsLiteralUnion({ '[Client] Remove client': true })
    public readonly type = '[Client] Remove client';
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
}

export class RestrictViewToViewportAction implements Action {
    @IsLiteralUnion({ '[Client] Restrict to viewport': true })
    public readonly type = '[Client] Restrict to viewport';
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public readonly viewportId?: UUID;
}

export class SetWaitingRoomAction implements Action {
    @IsLiteralUnion({ '[Client] Set waitingroom': true })
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
            getElement(draftState, 'clients', clientId);
            delete draftState.clients[clientId];
            return draftState;
        },
        rights: 'server',
    };

    export const restrictViewToViewport: ActionReducer<RestrictViewToViewportAction> =
        {
            action: RestrictViewToViewportAction,
            reducer: (draftState, { clientId, viewportId }) => {
                const client = getElement(draftState, 'clients', clientId);
                if (viewportId === undefined) {
                    client.viewRestrictedToViewportId = viewportId;
                    return draftState;
                }
                getElement(draftState, 'viewports', viewportId);
                client.viewRestrictedToViewportId = viewportId;
                return draftState;
            },
            rights: 'trainer',
        };

    export const setWaitingRoom: ActionReducer<SetWaitingRoomAction> = {
        action: SetWaitingRoomAction,
        reducer: (draftState, { clientId, shouldBeInWaitingRoom }) => {
            const client = getElement(draftState, 'clients', clientId);
            client.isInWaitingRoom = shouldBeInWaitingRoom;
            return draftState;
        },
        rights: 'trainer',
    };
}
