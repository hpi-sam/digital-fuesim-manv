/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-namespace */
import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { TransferPoint } from '../../models';
import { Position } from '../../models/utils';
import { uuidValidationOptions, UUID } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';

export class AddTransferPointAction implements Action {
    @IsString()
    public readonly type = `[TransferPoint] Add TransferPoint`;
    @ValidateNested()
    @Type(() => TransferPoint)
    public readonly transferPoint!: TransferPoint;
}

export class MoveTransferPointAction implements Action {
    @IsString()
    public readonly type = '[TransferPoint] Move TransferPoint';

    @IsUUID(4, uuidValidationOptions)
    public readonly transferPointId!: UUID;

    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export class RenameTransferPointAction implements Action {
    @IsString()
    public readonly type = '[TransferPoint] Rename TransferPoint';

    @IsUUID(4, uuidValidationOptions)
    public readonly transferPointId!: UUID;

    @IsString()
    public readonly internalName!: string;

    @IsString()
    public readonly externalName!: string;
}

export class RemoveTransferPointAction implements Action {
    @IsString()
    public readonly type = '[TransferPoint] Remove TransferPoint';

    @IsUUID(4, uuidValidationOptions)
    public readonly transferPointId!: UUID;
}

export namespace TransferPointActionReducers {
    export const addTransferPoint: ActionReducer<AddTransferPointAction> = {
        action: AddTransferPointAction,
        reducer: (draftState, { transferPoint }) => {
            draftState.transferPoints[transferPoint.id] = transferPoint;
            return draftState;
        },
        rights: 'trainer',
    };

    export const moveTransferPoint: ActionReducer<MoveTransferPointAction> = {
        action: MoveTransferPointAction,
        reducer: (draftState, { transferPointId, targetPosition }) => {
            const transferPoint = draftState.transferPoints[transferPointId];
            if (!transferPoint) {
                throw new ReducerError(
                    `TransferPoint with id ${transferPointId} does not exist`
                );
            }
            transferPoint.position = targetPosition;
            return draftState;
        },
        rights: 'trainer',
    };

    export const renameTransferPoint: ActionReducer<RenameTransferPointAction> =
        {
            action: RenameTransferPointAction,
            reducer: (
                draftState,
                { transferPointId, internalName, externalName }
            ) => {
                const transferPoint =
                    draftState.transferPoints[transferPointId];
                if (!transferPoint) {
                    throw new ReducerError(
                        `TransferPoint with id ${transferPointId} does not exist`
                    );
                }
                transferPoint.internalName = internalName;
                transferPoint.externalName = externalName;
                return draftState;
            },
            rights: 'trainer',
        };

    export const removeTransferPoint: ActionReducer<RemoveTransferPointAction> =
        {
            action: RemoveTransferPointAction,
            reducer: (draftState, { transferPointId }) => {
                if (!draftState.transferPoints[transferPointId]) {
                    throw new ReducerError(
                        `TransferPoint with id ${transferPointId} does not exist`
                    );
                }
                delete draftState.transferPoints[transferPointId];
                // TODO: If we can assume that the transfer points are always connected to each other,
                // we could just iterate over draftState.transferPoints[transferPointId].reachableTransferPoints
                for (const _transferPointId of Object.keys(
                    draftState.transferPoints
                )) {
                    const transferPoint =
                        draftState.transferPoints[_transferPointId];
                    for (const connectedTransferPointId of Object.keys(
                        transferPoint.reachableTransferPoints
                    )) {
                        const connectedTransferPoint =
                            draftState.transferPoints[connectedTransferPointId];
                        delete connectedTransferPoint.reachableTransferPoints[
                            transferPointId
                        ];
                    }
                }
                // TODO: Remove the vehicles and personnel in transit
                return draftState;
            },
            rights: 'trainer',
        };
}
