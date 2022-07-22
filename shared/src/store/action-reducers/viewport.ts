import { Type } from 'class-transformer';
import { IsBoolean, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Viewport } from '../../models';
import { Position, Size } from '../../models/utils';
import { AutomatedViewportConfig } from '../../models/utils/automated-viewport-config';
import { uuidValidationOptions, UUID, cloneDeepMutable } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils/get-element';

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

export class MoveViewportAction implements Action {
    @IsString()
    public readonly type = '[Viewport] Move viewport';
    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;
    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export class ResizeViewportAction implements Action {
    @IsString()
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
    @IsString()
    public readonly type = '[Viewport] Rename viewport';

    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;

    @IsString()
    public readonly newName!: string;
}

export class ChangeViewportAutomationState implements Action {
    @IsString()
    public readonly type = '[Viewport] Change automation activation state';

    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;

    @IsBoolean()
    public readonly activateAutomation!: boolean;
}

export class UpdateViewportAutomation implements Action {
    @IsString()
    public readonly type = '[Viewport] Update automation';

    @IsUUID(4, uuidValidationOptions)
    public readonly viewportId!: UUID;

    @ValidateNested()
    @Type(() => AutomatedViewportConfig)
    public readonly config!: AutomatedViewportConfig;
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
            viewport.position = targetPosition;
            return draftState;
        },
        rights: 'trainer',
    };

    export const resizeViewport: ActionReducer<ResizeViewportAction> = {
        action: ResizeViewportAction,
        reducer: (draftState, { viewportId, targetPosition, newSize }) => {
            const viewport = getElement(draftState, 'viewports', viewportId);
            viewport.position = targetPosition;
            viewport.size = newSize;
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

    export const changeViewportAutomationState: ActionReducer<ChangeViewportAutomationState> =
        {
            action: ChangeViewportAutomationState,
            reducer: (draftState, { viewportId, activateAutomation }) => {
                const viewport = getElement(
                    draftState,
                    'viewports',
                    viewportId
                );
                viewport.automatedPatientFieldConfig.isAutomated =
                    activateAutomation;
                return draftState;
            },
            rights: 'trainer',
        };

    export const updateViewportAutomation: ActionReducer<UpdateViewportAutomation> =
        {
            action: UpdateViewportAutomation,
            reducer: (draftState, { viewportId, config }) => {
                const viewport = getElement(
                    draftState,
                    'viewports',
                    viewportId
                );
                // Don't allow to change the activation state here
                const previousActivation =
                    viewport.automatedPatientFieldConfig.isAutomated;
                viewport.automatedPatientFieldConfig = cloneDeepMutable(config);
                viewport.automatedPatientFieldConfig.isAutomated =
                    previousActivation;
                return draftState;
            },
            rights: 'participant',
        };
}
