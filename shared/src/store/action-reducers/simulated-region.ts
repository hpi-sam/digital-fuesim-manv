import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { SimulatedRegion } from '../../models';
import { Position, Size } from '../../models/utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils/get-element';
import { removeElementPosition } from './utils/spatial-elements';

export class AddSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Add simulated region' as const)
    readonly type = '[SimulatedRegion] Add simulated region';
    @ValidateNested()
    @Type(() => SimulatedRegion)
    public simulatedRegion!: SimulatedRegion;
}

export class RemoveSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Remove simulated region' as const)
    public readonly type = '[SimulatedRegion] Remove simulated region';
    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;
}

export class MoveSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Move simulated region' as const)
    public readonly type = '[SimulatedRegion] Move simulated region';
    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;
    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export class ResizeSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Resize simulated region' as const)
    public readonly type = '[SimulatedRegion] Resize simulated region';
    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;
    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
    @ValidateNested()
    @Type(() => Size)
    public readonly newSize!: Size;
}

export class RenameSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Rename simulatedRegion' as const)
    public readonly type = '[SimulatedRegion] Rename simulatedRegion';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsString()
    public readonly newName!: string;
}

export class AddElementToSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Add Element' as const)
    public readonly type = '[SimulatedRegion] Add Element';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsLiteralUnion({
        materials: true,
        patients: true,
        personnel: true,
        vehicles: true,
    })
    public readonly elementToBeAddedType!:
        | 'materials'
        | 'patients'
        | 'personnel'
        | 'vehicles';

    @IsUUID(4, uuidValidationOptions)
    public readonly elementToBeAddedId!: UUID;
}

export namespace SimulatedRegionActionReducers {
    export const addSimulatedRegion: ActionReducer<AddSimulatedRegionAction> = {
        action: AddSimulatedRegionAction,
        reducer: (draftState, { simulatedRegion }) => {
            draftState.simulatedRegions[simulatedRegion.id] =
                cloneDeepMutable(simulatedRegion);
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeSimulatedRegion: ActionReducer<RemoveSimulatedRegionAction> =
        {
            action: RemoveSimulatedRegionAction,
            reducer: (draftState, { simulatedRegionId }) => {
                getElement(draftState, 'simulatedRegions', simulatedRegionId);
                delete draftState.simulatedRegions[simulatedRegionId];
                return draftState;
            },
            rights: 'trainer',
        };

    export const moveSimulatedRegion: ActionReducer<MoveSimulatedRegionAction> =
        {
            action: MoveSimulatedRegionAction,
            reducer: (draftState, { simulatedRegionId, targetPosition }) => {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegions',
                    simulatedRegionId
                );
                simulatedRegion.position = cloneDeepMutable(targetPosition);
                return draftState;
            },
            rights: 'trainer',
        };

    export const resizeSimulatedRegion: ActionReducer<ResizeSimulatedRegionAction> =
        {
            action: ResizeSimulatedRegionAction,
            reducer: (
                draftState,
                { simulatedRegionId, targetPosition, newSize }
            ) => {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegions',
                    simulatedRegionId
                );
                simulatedRegion.position = cloneDeepMutable(targetPosition);
                simulatedRegion.size = cloneDeepMutable(newSize);
                return draftState;
            },
            rights: 'trainer',
        };

    export const renameSimulatedRegion: ActionReducer<RenameSimulatedRegionAction> =
        {
            action: RenameSimulatedRegionAction,
            reducer: (draftState, { simulatedRegionId, newName }) => {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegions',
                    simulatedRegionId
                );
                simulatedRegion.name = newName;
                return draftState;
            },
            rights: 'trainer',
        };

    export const addElementToSimulatedRegion: ActionReducer<AddElementToSimulatedRegionAction> =
        {
            action: AddElementToSimulatedRegionAction,
            reducer: (
                draftState,
                { simulatedRegionId, elementToBeAddedId, elementToBeAddedType }
            ) => {
                // Test for existence of the simulate
                getElement(draftState, 'simulatedRegions', simulatedRegionId);
                const element = getElement(
                    draftState,
                    elementToBeAddedType,
                    elementToBeAddedId
                );

                switch (elementToBeAddedType) {
                    case 'materials':
                    case 'patients':
                    case 'personnel':
                        removeElementPosition(
                            draftState,
                            elementToBeAddedType,
                            elementToBeAddedId
                        );
                        break;
                    case 'vehicles':
                        break;
                }
                // FIXME: In the old broken positioning logic, this implies the personnel is in their vehicle instead of our simulatedRegion.
                element.position = undefined;

                element.metaPosition = {
                    type: 'simulatedRegion',
                    simulatedRegionId,
                };

                return draftState;
            },
            rights: 'participant',
        };
}
