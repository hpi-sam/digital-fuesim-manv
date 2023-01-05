import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { Position } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { updateElementPosition } from './utils/spatial-elements';

export class MovePersonnelAction implements Action {
    @IsValue('[Personnel] Move personnel' as const)
    public readonly type = '[Personnel] Move personnel';

    @IsUUID(4, uuidValidationOptions)
    public readonly personnelId!: UUID;

    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export namespace PersonnelActionReducers {
    export const movePersonnel: ActionReducer<MovePersonnelAction> = {
        action: MovePersonnelAction,
        reducer: (draftState, { personnelId, targetPosition }) => {
            updateElementPosition(
                draftState,
                'personnel',
                personnelId,
                targetPosition
            );
            return draftState;
        },
        rights: 'participant',
    };
}
