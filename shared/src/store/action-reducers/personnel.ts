import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Position } from '../../models/utils';
import { SpatialTree } from '../../models/utils/spatial-tree';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { updateTreatments } from './utils/calculate-treatments';
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

            if (startPosition !== undefined) {
                SpatialTree.moveElement(
                    draftState.spatialTrees.personnel,
                    personnel.id,
                    startPosition,
                    targetPosition
                );
            } else {
                SpatialTree.addElement(
                    draftState.spatialTrees.personnel,
                    personnel.id,
                    targetPosition
                );
            }

            personnel.position = cloneDeepMutable(targetPosition);

            updateTreatments(draftState, personnel);

            return draftState;
        },
        rights: 'participant',
    };
}
