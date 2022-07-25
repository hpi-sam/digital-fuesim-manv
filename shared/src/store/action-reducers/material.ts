import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Position } from '../../models/utils';
import { uuidValidationOptions, UUID, cloneDeepMutable } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
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
            material.position = cloneDeepMutable(targetPosition);
            calculateTreatments(draftState);
            return draftState;
        },
        rights: 'participant',
    };
}
