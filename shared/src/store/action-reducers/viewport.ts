import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Viewport } from '../../models';
import { Position, Size } from '../../models/utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils/get-element';

export class AddViewportAction implements Action {
    @IsValue('[Viewport] Add viewport' as const)
    readonly type = '[Viewport] Add viewport';
    @ValidateNested()
    @Type(() => Viewport)
    public viewport!: Viewport;
}

export class RemoveViewportAction implements Action {
    @IsValue('[Viewport] Remove viewport' as const)
    public readonly type = '[Viewport] Remove viewport';
    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;
}

export class MoveViewportAction implements Action {
    @IsValue('[Viewport] Move viewport' as const)
    public readonly type = '[Viewport] Move viewport';
    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;
    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export class ResizeViewportAction implements Action {
    @IsValue('[Viewport] Resize viewport' as const)
    public readonly type = '[Viewport] Resize viewport';
    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;
    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
    @ValidateNested()
    @Type(() => Size)
    public readonly newSize!: Size;
}

export class RenameViewportAction implements Action {
    @IsValue('[Viewport] Rename viewport' as const)
    public readonly type = '[Viewport] Rename viewport';

    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;

    @IsString()
    public readonly newName!: string;
}

export namespace ViewportActionReducers {
    export const addViewport: ActionReducer<AddViewportAction> = {
        action: AddViewportAction,
        reducer: (draftState, { viewport }) => {
            draftState.viewports[viewport.id] = cloneDeepMutable(viewport);
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeViewport: ActionReducer<RemoveViewportAction> = {
        action: RemoveViewportAction,
        reducer: (draftState, { viewportId }) => {
            getElement(draftState, 'viewports', viewportId);
            delete draftState.viewports[viewportId];
            return draftState;
        },
        rights: 'trainer',
    };

    export const moveViewport: ActionReducer<MoveViewportAction> = {
        action: MoveViewportAction,
        reducer: (draftState, { viewportId, targetPosition }) => {
            const viewport = getElement(draftState, 'viewports', viewportId);
            viewport.position = cloneDeepMutable(targetPosition);
            return draftState;
        },
        rights: 'trainer',
    };

    export const resizeViewport: ActionReducer<ResizeViewportAction> = {
        action: ResizeViewportAction,
        reducer: (draftState, { viewportId, targetPosition, newSize }) => {
            const viewport = getElement(draftState, 'viewports', viewportId);
            viewport.position = cloneDeepMutable(targetPosition);
            viewport.size = cloneDeepMutable(newSize);
            return draftState;
        },
        rights: 'trainer',
    };

    export const renameViewport: ActionReducer<RenameViewportAction> = {
        action: RenameViewportAction,
        reducer: (draftState, { viewportId, newName }) => {
            const viewport = getElement(draftState, 'viewports', viewportId);
            viewport.name = newName;
            return draftState;
        },
        rights: 'trainer',
    };
}
