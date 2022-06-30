import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Position } from '../../models/utils';
import { DataStructure } from '../../models/utils/datastructure';
import { UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
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
            const startPosition = personnel.position;

            if (startPosition === undefined) {
                throw new ReducerError(
                    `Personnel with id ${personnel.id} can't be moved, as its position is undefined`
                );
            }

            personnel.position = targetPosition;

            let personnelDataStructure =
                DataStructure.getDataStructureFromState(
                    draftState,
                    'personnel'
                );
            personnelDataStructure = DataStructure.moveElement(
                personnelDataStructure,
                personnel.id,
                [startPosition, targetPosition]
            );
            calculateTreatments(
                draftState,
                personnel,
                targetPosition,
                DataStructure.getDataStructureFromState(draftState, 'patients')
            );
            DataStructure.writeDataStructureToState(
                draftState,
                'personnel',
                personnelDataStructure
            );

            return draftState;
        },
        rights: 'participant',
    };
}
