import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { Position } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { updateElementPosition } from './utils/spatial-elements';

export class MoveMaterialAction implements Action {
    @IsValue('[Material] Move material' as const)
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
            updateElementPosition(
                draftState,
                'materials',
                materialId,
                targetPosition
            );
            return draftState;
        },
        rights: 'participant',
    };
}
