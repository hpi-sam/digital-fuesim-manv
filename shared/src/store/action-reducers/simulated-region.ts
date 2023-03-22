import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { SimulatedRegion, TransferPoint } from '../../models';
import {
    isInSpecificSimulatedRegion,
    MapCoordinates,
    MapPosition,
    SimulatedRegionPosition,
    Size,
} from '../../models/utils';
import {
    changePosition,
    changePositionWithId,
} from '../../models/utils/position/position-helpers-mutable';
import type {
    ReportBehaviorState,
    ReportableInformation,
    ExerciseSimulationEvent,
} from '../../simulation';
import {
    ExerciseSimulationBehaviorState,
    simulationBehaviorTypeOptions,
    VehicleArrivedEvent,
    PersonnelAvailableEvent,
    NewPatientEvent,
    MaterialAvailableEvent,
    reportableInformations,
    RecurringEventActivityState,
} from '../../simulation';
import { StartCollectingMaterialCountEvent } from '../../simulation/events/collect/start-collecting-material-count';
import { StartCollectingPatientCountEvent } from '../../simulation/events/collect/start-collecting-patient-count';
import { StartCollectingPersonnelCountEvent } from '../../simulation/events/collect/start-collecting-personnel-count';
import { StartCollectingTreatmentStatusEvent } from '../../simulation/events/collect/start-collecting-treatment-status';
import { StartCollectingVehicleCountEvent } from '../../simulation/events/collect/start-collecting-vehicle-count';
import { sendSimulationEvent } from '../../simulation/events/utils';
import { nextUUID } from '../../simulation/utils/randomness';
import type { Mutable } from '../../utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { ExpectedReducerError, ReducerError } from '../reducer-error';
import { TransferPointActionReducers } from './transfer-point';
import { isCompletelyLoaded } from './utils/completely-load-vehicle';
import { getElement, getElementByPredicate } from './utils/get-element';

export class AddSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Add simulated region' as const)
    readonly type = '[SimulatedRegion] Add simulated region';
    @ValidateNested()
    @Type(() => SimulatedRegion)
    public simulatedRegion!: SimulatedRegion;
    @ValidateNested()
    @Type(() => TransferPoint)
    public transferPoint!: TransferPoint;
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
    @IsValue('[SimulatedRegion] Rename simulated region' as const)
    public readonly type = '[SimulatedRegion] Rename simulated region';

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

export class RemoveBehaviorFromSimulatedRegionAction implements Action {
    @IsValue('[SimulatedRegion] Remove Behavior' as const)
    public readonly type = '[SimulatedRegion] Remove Behavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;
}

const createReminderEventMap: {
    [key in ReportableInformation]: () => ExerciseSimulationEvent;
} = {
    patientCount: StartCollectingPatientCountEvent.create,
    personnelCount: StartCollectingPersonnelCountEvent.create,
    vehicleCount: StartCollectingVehicleCountEvent.create,
    treatmentStatus: StartCollectingTreatmentStatusEvent.create,
    materialCount: StartCollectingMaterialCountEvent.create,
};

export namespace SimulatedRegionActionReducers {
    export const addSimulatedRegion: ActionReducer<AddSimulatedRegionAction> = {
        action: AddSimulatedRegionAction,
        reducer: (draftState, { simulatedRegion, transferPoint }) => {
            TransferPointActionReducers.addTransferPoint.reducer(draftState, {
                type: '[TransferPoint] Add TransferPoint',
                transferPoint,
            });
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
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                const transferPoint = getElementByPredicate(
                    draftState,
                    'transferPoint',
                    (element) =>
                        isInSpecificSimulatedRegion(element, simulatedRegion.id)
                );
                TransferPointActionReducers.removeTransferPoint.reducer(
                    draftState,
                    {
                        type: '[TransferPoint] Remove TransferPoint',
                        transferPointId: transferPoint.id,
                    }
                );
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
                const transferPoint = getElementByPredicate(
                    draftState,
                    'transferPoint',
                    (element) =>
                        isInSpecificSimulatedRegion(element, simulatedRegion.id)
                );
                TransferPointActionReducers.renameTransferPoint.reducer(
                    draftState,
                    {
                        type: '[TransferPoint] Rename TransferPoint',
                        transferPointId: transferPoint.id,
                        externalName: `[Simuliert] ${newName}`,
                    }
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

                if (
                    element.type === 'vehicle' &&
                    !isCompletelyLoaded(draftState, element)
                ) {
                    throw new ExpectedReducerError(
                        'Das Fahrzeug kann nur in die simulierte Region verschoben werden, wenn Personal und Material eingestiegen sind.'
                    );
                }

                changePosition(
                    element,
                    SimulatedRegionPosition.create(simulatedRegionId),
                    draftState
                );

                switch (element.type) {
                    case 'vehicle':
                        sendSimulationEvent(
                            simulatedRegion,
                            VehicleArrivedEvent.create(
                                element.id,
                                draftState.currentTime
                            )
                        );
                        break;
                    case 'patient':
                        sendSimulationEvent(
                            simulatedRegion,
                            NewPatientEvent.create(element.id)
                        );
                        break;
                    case 'personnel':
                        sendSimulationEvent(
                            simulatedRegion,
                            PersonnelAvailableEvent.create(element.id)
                        );
                        break;
                    case 'material':
                        sendSimulationEvent(
                            simulatedRegion,
                            MaterialAvailableEvent.create(element.id)
                        );
                        break;
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
                const mutableBehaviorState = simulatedRegion.behaviors.at(
                    -1
                ) as Mutable<ReportBehaviorState>;

                if (behaviorState.type === 'reportBehavior') {
                    const defaultDelay = 1000 * 60 * 5; // 5 minutes
                    reportableInformations.forEach((information) => {
                        const activityId = nextUUID(draftState);

                        mutableBehaviorState[`${information}ActivityId`] =
                            activityId;
                        simulatedRegion.activities[activityId] =
                            cloneDeepMutable(
                                RecurringEventActivityState.create(
                                    activityId,
                                    createReminderEventMap[information](),
                                    draftState.currentTime + defaultDelay,
                                    defaultDelay,
                                    true
                                )
                            );
                    });
                }

                return draftState;
            },
            rights: 'participant',
        };

    export const removeBehaviorFromSimulatedRegion: ActionReducer<RemoveBehaviorFromSimulatedRegionAction> =
        {
            action: RemoveBehaviorFromSimulatedRegionAction,
            reducer: (draftState, { simulatedRegionId, behaviorId }) => {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                const index = simulatedRegion.behaviors.findIndex(
                    (behavior) => behavior.id === behaviorId
                );

                const behaviorState = simulatedRegion.behaviors[index]!;
                if (behaviorState.type === 'reportBehavior') {
                    reportableInformations.forEach((information) => {
                        const activityId =
                            behaviorState[`${information}ActivityId`]!;
                        delete simulatedRegion.activities[activityId];
                    });
                }

                if (index === -1) {
                    throw new ReducerError(
                        `The simulated region with id ${simulatedRegionId} has no behavior with id ${behaviorId}. Therefore it could not be removed.`
                    );
                }
                simulatedRegion.behaviors.splice(index, 1);
                return draftState;
            },
            rights: 'participant',
        };
}
