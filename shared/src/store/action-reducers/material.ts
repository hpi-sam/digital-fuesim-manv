import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Position } from '../../models/utils';
import { SpatialTree } from '../../models/utils/spatial-tree';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { calculateTreatments } from './utils/calculate-treatments';
import { getElement } from './utils/get-element';

export class MoveMaterialAction implements Action {
    @IsString()
    public readonly type = '[Material] Move material';

    @IsUUID(4, uuidValidationOptions)
    public readonly materialId!: UUID;

    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export namespace MaterialActionReducers {
    export const moveMaterial: ActionReducer<MoveMaterialAction> = {
        action: MoveMaterialAction,
        reducer: (draftState, { materialId, targetPosition }) => {
            const material = getElement(draftState, 'materials', materialId);

            const startPosition = material.position;

            if (startPosition === undefined) {
                throw new ReducerError(
                    `Material with id ${material.id} can't be moved, as its position is undefined`
                );
            }

            material.position = cloneDeepMutable(targetPosition);

            SpatialTree.moveElement(draftState, 'materials', material.id, [
                startPosition,
                targetPosition,
            ]);
            calculateTreatments(draftState, material, targetPosition);

            return draftState;
        },
        rights: 'participant',
    };
}
