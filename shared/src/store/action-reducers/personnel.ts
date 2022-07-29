import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Position } from '../../models/utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { calculateTreatments } from './utils/calculate-treatments';
import { getElement } from './utils/get-element';

export class MovePersonnelAction implements Action {
    @IsString()
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
            const personnel = getElement(draftState, 'personnel', personnelId);
            personnel.position = cloneDeepMutable(targetPosition);
            calculateTreatments(draftState);
            return draftState;
        },
        rights: 'participant',
    };
}
