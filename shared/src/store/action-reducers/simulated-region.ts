import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { SimulatedRegion } from '../../models';
import {
    MapCoordinates,
    MapPosition,
    SimulatedRegionPosition,
    Size,
} from '../../models/utils';
import {
    changePosition,
    changePositionWithId,
} from '../../models/utils/position/position-helpers-mutable';
import {
    ExerciseSimulationBehaviorState,
    sendSimulationEvent,
    simulationBehaviorTypeOptions,
    VehicleArrivedEvent,
} from '../../simulation';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils/get-element';

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
    @Type(() => MapCoordinates)
    public readonly targetPosition!: MapCoordinates;
}

export class ResizeSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Resize simulated region' as const)
    public readonly type = '[SimulatedRegion] Resize simulated region';
    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;
    @ValidateNested()
    @Type(() => MapCoordinates)
    public readonly targetPosition!: MapCoordinates;
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
        material: true,
        patient: true,
        personnel: true,
        vehicle: true,
    })
    public readonly elementToBeAddedType!:
        | 'material'
        | 'patient'
        | 'personnel'
        | 'vehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly elementToBeAddedId!: UUID;
}

export class AddBehaviorToSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Add Behavior' as const)
    public readonly type = '[SimulatedRegion] Add Behavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @Type(...simulationBehaviorTypeOptions)
    @ValidateNested()
    public readonly behaviorState!: ExerciseSimulationBehaviorState;
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
                getElement(draftState, 'simulatedRegion', simulatedRegionId);
                delete draftState.simulatedRegions[simulatedRegionId];
                return draftState;
            },
            rights: 'trainer',
        };

    export const moveSimulatedRegion: ActionReducer<MoveSimulatedRegionAction> =
        {
            action: MoveSimulatedRegionAction,
            reducer: (draftState, { simulatedRegionId, targetPosition }) => {
                changePositionWithId(
                    simulatedRegionId,
                    MapPosition.create(targetPosition),
                    'simulatedRegion',
                    draftState
                );
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
                    'simulatedRegion',
                    simulatedRegionId
                );
                changePosition(
                    simulatedRegion,
                    MapPosition.create(targetPosition),
                    draftState
                );
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
                    'simulatedRegion',
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
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                const element = getElement(
                    draftState,
                    elementToBeAddedType,
                    elementToBeAddedId
                );

                changePosition(
                    element,
                    SimulatedRegionPosition.create(simulatedRegionId),
                    draftState
                );

                if (element.type === 'vehicle') {
                    sendSimulationEvent(
                        simulatedRegion,
                        VehicleArrivedEvent.create(
                            element.id,
                            draftState.currentTime
                        )
                    );
                }

                return draftState;
            },
            rights: 'participant',
        };

    export const addBehaviorToSimulatedRegion: ActionReducer<AddBehaviorToSimulatedRegionAction> =
        {
            action: AddBehaviorToSimulatedRegionAction,
            reducer: (draftState, { simulatedRegionId, behaviorState }) => {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                simulatedRegion.behaviors.push(cloneDeepMutable(behaviorState));
                return draftState;
            },
            rights: 'participant',
        };
}
