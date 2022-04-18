/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-namespace */
import { Type } from 'class-transformer';
import {
    IsString,
    ValidateNested,
    IsUUID,
    IsOptional,
    IsBoolean,
} from 'class-validator';
import { Client } from '../../models';
import { uuidValidationOptions, UUID } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';

export class AddClientAction implements Action {
    @IsString()
    public readonly type = '[Client] Add client';
    @ValidateNested()
    @Type(() => Client)
    public readonly client!: Client;
}

export class RemoveClientAction implements Action {
    @IsString()
    public readonly type = '[Client] Remove client';
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
}

export class RestrictViewToViewportAction implements Action {
    @IsString()
    public readonly type = '[Client] Restrict to viewport';
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public readonly viewportId?: UUID;
}

export class SetWaitingRoomAction implements Action {
    @IsString()
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
            draftState.clients[client.id] = client;
            return draftState;
        },
        rights: 'server',
    };

    export const removeClient: ActionReducer<RemoveClientAction> = {
        action: RemoveClientAction,
        reducer: (draftState, { clientId }) => {
            if (!draftState.clients[clientId]) {
                throw new ReducerError(
                    `Client with id ${clientId} does not exist`
                );
            }
            delete draftState.clients[clientId];
            return draftState;
        },
        rights: 'server',
    };

    export const restrictViewToViewport: ActionReducer<RestrictViewToViewportAction> =
        {
            action: RestrictViewToViewportAction,
            reducer: (draftState, { clientId, viewportId }) => {
                if (!draftState.clients[clientId]) {
                    throw new ReducerError(
                        `Client with id ${clientId} does not exist`
                    );
                }
                if (viewportId === undefined) {
                    draftState.clients[clientId].viewRestrictedToViewportId =
                        viewportId;
                    return draftState;
                }
                if (!draftState.viewports[viewportId]) {
                    throw new ReducerError(
                        `Viewport with id ${viewportId} does not exist`
                    );
                }
                draftState.clients[clientId].viewRestrictedToViewportId =
                    viewportId;
                return draftState;
            },
            rights: 'trainer',
        };

    export const setWaitingRoom: ActionReducer<SetWaitingRoomAction> = {
        action: SetWaitingRoomAction,
        reducer: (draftState, { clientId, shouldBeInWaitingRoom }) => {
            if (!draftState.clients[clientId]) {
                throw new ReducerError(
                    `Client with id ${clientId} does not exist`
                );
            }
            draftState.clients[clientId].isInWaitingRoom =
                shouldBeInWaitingRoom;
            return draftState;
        },
        rights: 'trainer',
    };
}
