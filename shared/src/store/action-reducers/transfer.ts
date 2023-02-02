import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { TransferPoint } from '../../models';
import type { MapCoordinates } from '../../models/utils';
import {
    isInTransfer,
    isNotInTransfer,
    currentTransferOf,
    TransferPosition,
    currentCoordinatesOf,
    MapPosition,
    StartPoint,
    startPointTypeOptions,
} from '../../models/utils';
import { changePosition } from '../../models/utils/position/position-helpers-mutable';
import type { ExerciseState } from '../../state';
import { imageSizeToPosition } from '../../state-helpers';
import type { Mutable } from '../../utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import type { AllowedValues } from '../../utils/validators';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { getElement } from './utils';

export type TransferableElementType = 'personnel' | 'vehicle';
const transferableElementTypeAllowedValues: AllowedValues<TransferableElementType> =
    { personnel: true, vehicle: true };

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
    if (isNotInTransfer(element)) {
        throw getNotInTransferError(element.id);
    }
    const targetTransferPoint = getElement(
        draftState,
        'transferPoint',
        currentTransferOf(element).targetTransferPointId
    );
    const newPosition: Mutable<MapCoordinates> = {
        x: currentCoordinatesOf(targetTransferPoint).x,
        y:
            currentCoordinatesOf(targetTransferPoint).y +
            // Position it in the upper half of the transferPoint
            imageSizeToPosition(TransferPoint.image.height / 3),
    };
    changePosition(element, MapPosition.create(newPosition), draftState);
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
            getElement(draftState, 'transferPoint', targetTransferPointId);
            const element = getElement(draftState, elementType, elementId);

            if (isInTransfer(element)) {
                throw new ReducerError(
                    `Element with id ${element.id} is already in transfer`
                );
            }

            // Get the duration
            let duration: number;
            if (startPoint.type === 'transferStartPoint') {
                const transferStartPoint = getElement(
                    draftState,
                    'transferPoint',
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

            // Set the element to transfer
            changePosition(
                element,
                TransferPosition.create({
                    startPoint: cloneDeepMutable(startPoint),
                    targetTransferPointId,
                    endTimeStamp: draftState.currentTime + duration,
                    isPaused: false,
                }),
                draftState
            );

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
            if (isNotInTransfer(element)) {
                throw getNotInTransferError(element.id);
            }
            const newTransfer = cloneDeepMutable(currentTransferOf(element));
            if (targetTransferPointId) {
                // check if transferPoint exists

                getElement(draftState, 'transferPoint', targetTransferPointId);
                newTransfer.targetTransferPointId = targetTransferPointId;
            }
            if (timeToAdd) {
                //  The endTimeStamp shouldn't be less then the current time
                newTransfer.endTimeStamp = Math.max(
                    draftState.currentTime,
                    newTransfer.endTimeStamp + timeToAdd
                );
            }
            changePosition(
                element,
                TransferPosition.create(newTransfer),
                draftState
            );
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
            getElement(draftState, 'transferPoint', targetTransferPointId);
            const element = getElement(draftState, elementType, elementId);
            if (isNotInTransfer(element)) {
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
                if (isNotInTransfer(element)) {
                    throw getNotInTransferError(element.id);
                }
                const newTransfer = cloneDeepMutable(
                    currentTransferOf(element)
                );
                newTransfer.isPaused = !newTransfer.isPaused;
                changePosition(
                    element,
                    TransferPosition.create(newTransfer),
                    draftState
                );
                return draftState;
            },
            rights: 'trainer',
        };
}

function getNotInTransferError(elementId: UUID) {
    return new ReducerError(`Element with id ${elementId} is not in transfer`);
}
