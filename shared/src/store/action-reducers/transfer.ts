import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { getElement } from './utils/get-element';

export class AddToTransferAction implements Action {
    @IsString()
    public readonly type = '[Transfer] Add to transfer';

    @IsString()
    elementType!: 'personnel' | 'vehicles';

    @IsUUID(4, uuidValidationOptions)
    public readonly elementId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly startTransferPointId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId!: UUID;
}

export class EditTransferAction implements Action {
    @IsString()
    public readonly type = '[Transfer] Edit transfer';

    @IsString()
    elementType!: 'personnel' | 'vehicles';

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
     * If the time set the the end of the transfer time to the past, it sets it to the current time.
     */
    public readonly timeToAdd?: number;
}

export class TogglePauseTransferAction implements Action {
    @IsString()
    public readonly type = '[Transfer] Toggle pause transfer';

    @IsString()
    elementType!: 'personnel' | 'vehicles';

    @IsUUID(4, uuidValidationOptions)
    public readonly elementId!: UUID;
}

export namespace TransferActionReducers {
    export const addToTransfer: ActionReducer<AddToTransferAction> = {
        action: AddToTransferAction,
        reducer: (
            draftState,
            {
                elementType,
                elementId,
                startTransferPointId,
                targetTransferPointId,
            }
        ) => {
            const element = getElement(draftState, elementType, elementId);
            if (element.transfer) {
                throw new ReducerError(
                    `Element with id ${element.id} is already in transfer`
                );
            }
            const startTransferPoint = getElement(
                draftState,
                'transferPoints',
                startTransferPointId
            );
            const connection =
                startTransferPoint.reachableTransferPoints[
                    targetTransferPointId
                ];
            if (!connection) {
                throw new ReducerError(
                    `TransferPoint with id ${targetTransferPointId} is not reachable from ${startTransferPointId}`
                );
            }
            // The element is now in transfer
            delete element.position;
            element.transfer = {
                startTransferPointId,
                targetTransferPointId,
                endTimeStamp: draftState.currentTime + connection.duration,
                isPaused: false,
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
                element.transfer.targetTransferPointId = targetTransferPointId;
            }
            if (timeToAdd !== undefined) {
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
