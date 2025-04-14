import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { MapPosition, MapCoordinates } from '../../models/utils/index.js';
import { changePositionWithId } from '../../models/utils/position/position-helpers-mutable.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { Action, ActionReducer } from '../action-reducer.js';

export class MoveMaterialAction implements Action {
    @IsValue('[Material] Move material' as const)
    public readonly type = '[Material] Move material';

    @IsUUID(4, uuidValidationOptions)
    public readonly materialId!: UUID;

    @ValidateNested()
    @Type(() => MapCoordinates)
    public readonly targetPosition!: MapCoordinates;
}

export namespace MaterialActionReducers {
    export const moveMaterial: ActionReducer<MoveMaterialAction> = {
        action: MoveMaterialAction,
        reducer: (draftState, { materialId, targetPosition }) => {
            changePositionWithId(
                materialId,
                MapPosition.create(targetPosition),
                'material',
                draftState
            );
            return draftState;
        },
        rights: 'participant',
    };
}
