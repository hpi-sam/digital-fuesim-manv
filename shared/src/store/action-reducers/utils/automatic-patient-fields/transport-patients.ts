import type { Vehicle, Viewport } from '../../../../models';
import { Patient } from '../../../../models';
import type { CanCaterFor } from '../../../../models/utils';
import { TransferStartPoint } from '../../../../models/utils';
import type { ExerciseState } from '../../../../state';
import type { Mutable, UUID } from '../../../../utils';
import { transportPatientToHospitalReducer } from '../../hospital';
import { addToTransferReducer } from '../../transfer';
import { loadVehicleReducer } from '../../vehicle';
import { compareCaterer, getComparePatients } from './utils';

/**
 * @returns Whether a patient was transported
 */
export function transportPatient(
    state: Mutable<ExerciseState>,
    viewport: Viewport,
    vehicleIds: UUID[],
    personnelIds: UUID[],
    patientIds: UUID[]
): boolean {
    if (viewport.automatedPatientFieldConfig.transferMode === 'none') {
        return false;
    }
    const vehicleForTransport = vehicleIds
        .map((vehicleId) => state.vehicles[vehicleId])
        .filter((vehicle) =>
            Object.keys(vehicle.personnelIds).every((personnelId) =>
                personnelIds.includes(personnelId)
            )
        )
        .sort(
            (left, right) => -getOrderVehiclesByCatering(state)(left, right)
        )[0];

    if (vehicleForTransport === undefined) return false;
    const patientToTransport = patientIds
        .map((patientId) => state.patients[patientId])
        .filter(
            (patient) =>
                !['white', 'black'].includes(
                    Patient.getVisibleStatus(
                        patient,
                        state.configuration.pretriageEnabled,
                        state.configuration.bluePatientsEnabled
                    )
                )
        )
        .sort(getComparePatients(state, 'yellow'))[0];
    if (patientToTransport === undefined) return false;
    loadVehicleReducer(
        state,
        vehicleForTransport.id,
        patientToTransport.id,
        'patient'
    );
    if (viewport.automatedPatientFieldConfig.transferMode === 'hospital') {
        transportPatientToHospitalReducer(
            state,
            viewport.automatedPatientFieldConfig.targetHospitalId!,
            vehicleForTransport.id
        );
    } else {
        addToTransferReducer(
            state,
            'vehicles',
            vehicleForTransport.id,
            TransferStartPoint.create(
                viewport.automatedPatientFieldConfig.sourceTransferPointId!
            ),
            viewport.automatedPatientFieldConfig.targetTransferPointId!
        );
    }
    return true;
}

function getOrderVehiclesByCatering(
    state: ExerciseState
): (left: Vehicle, right: Vehicle) => number {
    return (left: Vehicle, right: Vehicle): number => {
        const leftPersonnel: CanCaterFor = {
            green: Object.keys(left.personnelIds)
                .map(
                    (personnelId) =>
                        state.personnel[personnelId].canCaterFor.green
                )
                .reduce((previous, current) => previous + current, 0),
            yellow: Object.keys(left.personnelIds)
                .map(
                    (personnelId) =>
                        state.personnel[personnelId].canCaterFor.yellow
                )
                .reduce((previous, current) => previous + current, 0),
            red: Object.keys(left.personnelIds)
                .map(
                    (personnelId) =>
                        state.personnel[personnelId].canCaterFor.red
                )
                .reduce((previous, current) => previous + current, 0),
            logicalOperator: 'and',
        };
        const rightPersonnel: CanCaterFor = {
            green: Object.keys(right.personnelIds)
                .map(
                    (personnelId) =>
                        state.personnel[personnelId].canCaterFor.green
                )
                .reduce((previous, current) => previous + current, 0),
            yellow: Object.keys(right.personnelIds)
                .map(
                    (personnelId) =>
                        state.personnel[personnelId].canCaterFor.yellow
                )
                .reduce((previous, current) => previous + current, 0),
            red: Object.keys(right.personnelIds)
                .map(
                    (personnelId) =>
                        state.personnel[personnelId].canCaterFor.red
                )
                .reduce((previous, current) => previous + current, 0),
            logicalOperator: 'and',
        };
        const leftMaterial: CanCaterFor = {
            green: Object.keys(left.materialIds)
                .map(
                    (materialId) =>
                        state.materials[materialId].canCaterFor.green
                )
                .reduce((previous, current) => previous + current, 0),
            yellow: Object.keys(left.materialIds)
                .map(
                    (materialId) =>
                        state.materials[materialId].canCaterFor.yellow
                )
                .reduce((previous, current) => previous + current, 0),
            red: Object.keys(left.materialIds)
                .map(
                    (materialId) => state.materials[materialId].canCaterFor.red
                )
                .reduce((previous, current) => previous + current, 0),
            logicalOperator: 'and',
        };
        const rightMaterial: CanCaterFor = {
            green: Object.keys(right.materialIds)
                .map(
                    (materialId) =>
                        state.materials[materialId].canCaterFor.green
                )
                .reduce((previous, current) => previous + current, 0),
            yellow: Object.keys(right.materialIds)
                .map(
                    (materialId) =>
                        state.materials[materialId].canCaterFor.yellow
                )
                .reduce((previous, current) => previous + current, 0),
            red: Object.keys(right.materialIds)
                .map(
                    (materialId) => state.materials[materialId].canCaterFor.red
                )
                .reduce((previous, current) => previous + current, 0),
            logicalOperator: 'and',
        };

        const personnelCompare = compareCaterer(
            { canCaterFor: leftPersonnel },
            { canCaterFor: rightPersonnel }
        );
        if (personnelCompare !== 0) {
            return personnelCompare;
        }

        return compareCaterer(
            { canCaterFor: leftMaterial },
            { canCaterFor: rightMaterial }
        );
    };
}
