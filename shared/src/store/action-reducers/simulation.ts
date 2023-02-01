import { IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';

export class AssignPersonnelToPatient implements Action {
    @IsValue('[Simulation] Assign personnel to patient' as const)
    readonly type = '[Simulation] Assign personnel to patient';

    @IsUUID(4, uuidValidationOptions)
    public readonly personnelId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;
}

export class AssignMaterialToPatient implements Action {
    @IsValue('[Simulation] Assign material to patient' as const)
    readonly type = '[Simulation] Assign material to patient';

    @IsUUID(4, uuidValidationOptions)
    public readonly materialId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;
}

export class RemoveAssignmentOfPersonnelToPatient implements Action {
    @IsValue('[Simulation] Remove assignment of personnel to patient' as const)
    readonly type = '[Simulation] Remove assignment of personnel to patient';

    @IsUUID(4, uuidValidationOptions)
    public readonly personnelId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;
}

export class RemoveAssignmentOfMaterialToPatient implements Action {
    @IsValue('[Simulation] Remove assignment of material to patient' as const)
    readonly type = '[Simulation] Remove assignment of material to patient';

    @IsUUID(4, uuidValidationOptions)
    public readonly materialId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;
}

export namespace SimulationActionReducers {
    export const assignPersonnelToPatient: ActionReducer<AssignPersonnelToPatient> =
        {
            action: AssignPersonnelToPatient,
            reducer: (draftState, { personnelId, patientId }) => {
                draftState.personnel[personnelId]!.assignedPatientIds[
                    patientId
                ] = true;
                draftState.patients[patientId]!.assignedPersonnelIds[
                    personnelId
                ] = true;
                return draftState;
            },
            rights: 'server',
        };

    export const assignMaterialToPatient: ActionReducer<AssignMaterialToPatient> =
        {
            action: AssignMaterialToPatient,
            reducer: (draftState, { materialId, patientId }) => {
                draftState.materials[materialId]!.assignedPatientIds[
                    patientId
                ] = true;
                draftState.patients[patientId]!.assignedMaterialIds[
                    materialId
                ] = true;
                return draftState;
            },
            rights: 'server',
        };

    export const removeAssignmentOfPersonnelToPatient: ActionReducer<RemoveAssignmentOfPersonnelToPatient> =
        {
            action: RemoveAssignmentOfPersonnelToPatient,
            reducer: (draftState, { personnelId, patientId }) => {
                delete draftState.personnel[personnelId]!.assignedPatientIds[
                    patientId
                ];
                delete draftState.patients[patientId]!.assignedPersonnelIds[
                    personnelId
                ];
                return draftState;
            },
            rights: 'server',
        };

    export const removeAssignmentOfMaterialToPatient: ActionReducer<RemoveAssignmentOfMaterialToPatient> =
        {
            action: RemoveAssignmentOfMaterialToPatient,
            reducer: (draftState, { materialId, patientId }) => {
                delete draftState.materials[materialId]!.assignedPatientIds[
                    patientId
                ];
                delete draftState.patients[patientId]!.assignedMaterialIds[
                    materialId
                ];
                return draftState;
            },
            rights: 'server',
        };
}
