import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { TransferPoint } from '../../models';
import type { Position } from '../../models/utils';
import { StartPoint, startPointTypeOptions } from '../../models/utils';
import type { ExerciseState } from '../../state';
import { imageSizeToPosition } from '../../state-helpers';
import type { Mutable } from '../../utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import type { AllowedValues } from '../../utils/validators';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { getElement } from './utils';
import {
    removeElementPosition,
    updateElementPosition,
} from './utils/spatial-elements';

type TransferableElementType = 'personnel' | 'vehicles';
const transferableElementTypeAllowedValues: AllowedValues<TransferableElementType> =
    { personnel: true, vehicles: true };

/**
 * Personnel/Vehicle in transfer will arrive immediately at new targetTransferPoint
 * Transfer gets deleted afterwards
 * @param elementId of an element that is in transfer
 */
export function letElementArrive(
    draftState: Mutable<ExerciseState>,
    elementType: TransferableElementType,
    elementId: UUID
) {
    const element = getElement(draftState, elementType, elementId);
    // check that element is in transfer, this should be always the case where this function is used
    if (!element.transfer) {
        throw getNotInTransferError(element.id);
    }
    const targetTransferPoint = getElement(
        draftState,
        'transferPoints',
        element.transfer.targetTransferPointId
    );
    const newPosition: Mutable<Position> = {
        x: targetTransferPoint.position.x,
        y:
            targetTransferPoint.position.y +
            // Position it in the upper half of the transferPoint
            imageSizeToPosition(TransferPoint.image.height / 3),
    };
    if (elementType === 'personnel') {
        updateElementPosition(draftState, 'personnel', element.id, newPosition);
    } else {
        element.position = newPosition;
        element.metaPosition = {
            type: 'coordinates',
            position: newPosition,
        };
    }
    delete element.transfer;
}

export class AddToTransferAction implements Action {
    @IsValue('[Transfer] Add to transfer' as const)
    public readonly type = '[Transfer] Add to transfer';

    @IsLiteralUnion(transferableElementTypeAllowedValues)
    elementType!: TransferableElementType;

    @IsUUID(4, uuidValidationOptions)
    public readonly elementId!: UUID;

    @ValidateNested()
    @Type(() => Object, startPointTypeOptions)
    public readonly startPoint!: StartPoint;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId!: UUID;
}

export class EditTransferAction implements Action {
    @IsValue('[Transfer] Edit transfer' as const)
    public readonly type = '[Transfer] Edit transfer';

    @IsLiteralUnion(transferableElementTypeAllowedValues)
    elementType!: TransferableElementType;

    @IsUUID(4, uuidValidationOptions)
    public readonly elementId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public readonly targetTransferPointId?: UUID;

    @IsInt()
    @IsOptional()
    /**
     * How much time in ms should be added to the transfer time.
     * If it is negative, the transfer time will be decreased.
     * If the time is set to a time in the past it will be set to the current time.
     */
    public readonly timeToAdd?: number;
}

export class FinishTransferAction implements Action {
    @IsValue('[Transfer] Finish transfer' as const)
    public readonly type = '[Transfer] Finish transfer';

    @IsLiteralUnion(transferableElementTypeAllowedValues)
    elementType!: TransferableElementType;

    @IsUUID(4, uuidValidationOptions)
    public readonly elementId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId!: UUID;
}

export class TogglePauseTransferAction implements Action {
    @IsValue('[Transfer] Toggle pause transfer' as const)
    public readonly type = '[Transfer] Toggle pause transfer';

    @IsLiteralUnion(transferableElementTypeAllowedValues)
    elementType!: TransferableElementType;

    @IsUUID(4, uuidValidationOptions)
    public readonly elementId!: UUID;
}

export namespace TransferActionReducers {
    export const addToTransfer: ActionReducer<AddToTransferAction> = {
        action: AddToTransferAction,
        reducer: (
            draftState,
            { elementType, elementId, startPoint, targetTransferPointId }
        ) => {
            // check if transferPoint exists
            getElement(draftState, 'transferPoints', targetTransferPointId);
            const element = getElement(draftState, elementType, elementId);
            if (element.transfer) {
                throw new ReducerError(
                    `Element with id ${element.id} is already in transfer`
                );
            }

            // Get the duration
            let duration: number;
            if (startPoint.type === 'transferPoint') {
                const transferStartPoint = getElement(
                    draftState,
                    'transferPoints',
                    startPoint.transferPointId
                );
                const connection =
                    transferStartPoint.reachableTransferPoints[
                        targetTransferPointId
                    ];
                if (!connection) {
                    throw new ReducerError(
                        `TransferPoint with id ${targetTransferPointId} is not reachable from ${transferStartPoint.id}`
                    );
                }
                duration = connection.duration;
            } else {
                duration = startPoint.duration;
            }

            // Remove the position of the element
            if (elementType === 'personnel') {
                removeElementPosition(draftState, 'personnel', element.id);
            } else {
                element.position = undefined;
            }
            // Set the element to transfer
            element.transfer = {
                startPoint: cloneDeepMutable(startPoint),
                targetTransferPointId,
                endTimeStamp: draftState.currentTime + duration,
                isPaused: false,
            };

            element.metaPosition = {
                type: 'transfer',
                transfer: {
                    startPoint: cloneDeepMutable(startPoint),
                    targetTransferPointId,
                    endTimeStamp: draftState.currentTime + duration,
                    isPaused: false,
                },
            };

            return draftState;
        },
        rights: 'participant',
    };

    export const editTransfer: ActionReducer<EditTransferAction> = {
        action: EditTransferAction,
        reducer: (
            draftState,
            { elementType, elementId, targetTransferPointId, timeToAdd }
        ) => {
            const element = getElement(draftState, elementType, elementId);
            if (!element.transfer) {
                throw getNotInTransferError(element.id);
            }
            if (targetTransferPointId) {
                // check if transferPoint exists
                getElement(draftState, 'transferPoints', targetTransferPointId);
                element.transfer.targetTransferPointId = targetTransferPointId;
            }
            if (timeToAdd) {
                //  The endTimeStamp shouldn't be less then the current time
                element.transfer.endTimeStamp = Math.max(
                    draftState.currentTime,
                    element.transfer.endTimeStamp + timeToAdd
                );
            }
            return draftState;
        },
        rights: 'trainer',
    };

    export const finishTransfer: ActionReducer<FinishTransferAction> = {
        action: FinishTransferAction,
        reducer: (
            draftState,
            { elementType, elementId, targetTransferPointId }
        ) => {
            // check if transferPoint exists
            getElement(draftState, 'transferPoints', targetTransferPointId);
            const element = getElement(draftState, elementType, elementId);
            if (!element.transfer) {
                throw getNotInTransferError(element.id);
            }
            letElementArrive(draftState, elementType, elementId);
            return draftState;
        },
        rights: 'trainer',
    };

    export const togglePauseTransfer: ActionReducer<TogglePauseTransferAction> =
        {
            action: TogglePauseTransferAction,
            reducer: (draftState, { elementType, elementId }) => {
                const element = getElement(draftState, elementType, elementId);
                if (!element.transfer) {
                    throw getNotInTransferError(element.id);
                }
                element.transfer.isPaused = !element.transfer.isPaused;
                return draftState;
            },
            rights: 'trainer',
        };
}

function getNotInTransferError(elementId: UUID) {
    return new ReducerError(`Element with id ${elementId} is not in transfer`);
}
