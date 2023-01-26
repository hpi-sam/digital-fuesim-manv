import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { MapPosition, MapCoordinates } from '../../models/utils';
import { changePositionWithId } from '../../models/utils/position/position-helpers-mutable';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';

export class MovePersonnelAction implements Action {
    @IsValue('[Personnel] Move personnel' as const)
    public readonly type = '[Personnel] Move personnel';

    @IsUUID(4, uuidValidationOptions)
    public readonly personnelId!: UUID;

    @ValidateNested()
    @Type(() => MapCoordinates)
    public readonly targetPosition!: MapCoordinates;
}

export namespace PersonnelActionReducers {
    export const movePersonnel: ActionReducer<MovePersonnelAction> = {
        action: MovePersonnelAction,
        reducer: (draftState, { personnelId, targetPosition }) => {
            changePositionWithId(
                personnelId,
                MapPosition.create(targetPosition),
                'personnel',
                draftState
            );
            return draftState;
        },
        rights: 'participant',
    };
}
