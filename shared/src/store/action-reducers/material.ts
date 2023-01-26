import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { MapPosition, Position } from '../../models/utils';
import { changePositionWithId } from '../../models/utils/position/meta-position-helpers-mutable';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';

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
            changePositionWithId(
                materialId,
                MapPosition.create(targetPosition),
                'materials',
                draftState
            );
            return draftState;
        },
        rights: 'participant',
    };
}
