/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-namespace */
import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Viewport } from '../../models';
import { uuidValidationOptions, UUID } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';

export class AddViewportAction implements Action {
    @IsString()
    readonly type = '[Viewport] Add viewport';
    @ValidateNested()
    @Type(() => Viewport)
    public viewport!: Viewport;
}

export class RemoveViewportAction implements Action {
    @IsString()
    public readonly type = '[Viewport] Remove viewport';
    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;
}

export namespace ViewportActionReducers {
    export const addViewport: ActionReducer<AddViewportAction> = {
        action: AddViewportAction,
        reducer: (draftState, { viewport }) => {
            draftState.viewports[viewport.id] = viewport;
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeViewport: ActionReducer<RemoveViewportAction> = {
        action: RemoveViewportAction,
        reducer: (draftState, { viewportId }) => {
            if (!draftState.viewports[viewportId]) {
                throw new ReducerError(
                    `Viewport with id ${viewportId} does not exist`
                );
            }
            delete draftState.viewports[viewportId];
            return draftState;
        },
        rights: 'trainer',
    };
}
