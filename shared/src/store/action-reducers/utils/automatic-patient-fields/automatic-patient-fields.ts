// import { personnelTemplateMap } from '../../../data/default-state';
import type { Material, Personnel, Viewport } from '../../../../models';
import { Patient } from '../../../../models';
import type { PatientStatus } from '../../../../models/utils';
import type { ExerciseState } from '../../../../state';
import type { Mutable } from '../../../../utils';
import { buildMaterialAxis } from './material-axis';
import {
    initialPositioning,
    placeRemainingPersonnel,
} from './personnel-material';
import { pretriage } from './pretriage';
import { transportPatient } from './transport-patients';
import {
    positionWalkableOrGreenPatients,
    treatGreenPatients,
} from './treat-green-patients';
import {
    assureCanCater,
    compareCaterer,
    getElementIdsFromState,
    getMaterialDistribution,
} from './utils';
import { unloadAndPositionVehicles } from './vehicles';

export function automaticPatientFields(state: Mutable<ExerciseState>): void {
    Object.values(state.viewports)
        .filter((viewport) => viewport.automatedPatientFieldConfig.isAutomated)
        .forEach((viewport) => automaticPatientField(state, viewport));
}

function automaticPatientField(
    state: Mutable<ExerciseState>,
    viewport: Viewport
): void {
    const treatableStatuses = [
        'red',
        'yellow',
        'green',
        'white',
    ] as PatientStatus[];
    let transferredAPatient: boolean;
    do {
        const patientIdsToCaterFor = getElementIdsFromState<Patient>(
            state,
            viewport,
            'patients',
            (patient) =>
                treatableStatuses.includes(
                    Patient.getVisibleStatus(
                        patient,
                        state.configuration.pretriageEnabled,
                        state.configuration.bluePatientsEnabled
                    )
                )
        );

        const vehicleIds = unloadAndPositionVehicles(state, viewport);

        /**
         * Personnel that is already at the viewport
         */
        const presentAvailablePersonnelIds = getElementIdsFromState<Personnel>(
            state,
            viewport,
            'personnel',
            undefined,
            compareCaterer
        );

        /**
         * Material that is already at the viewport
         */
        const presentAvailableMaterialIds = getElementIdsFromState<Material>(
            state,
            viewport,
            'materials',
            undefined,
            compareCaterer
        );

        initialPositioning(
            state,
            viewport,
            presentAvailablePersonnelIds,
            presentAvailableMaterialIds
        );

        if (patientIdsToCaterFor.length === 0) {
            // There are no patients. We have nothing to do.
            return;
        }

        // Remove personnel and material that cannot treat
        const presentAvailableCateringPersonnelIds =
            presentAvailablePersonnelIds.filter((personnelId) =>
                assureCanCater(state.personnel[personnelId])
            );
        const presentAvailableCateringMaterialIds =
            presentAvailableMaterialIds.filter((materialId) =>
                assureCanCater(state.materials[materialId])
            );

        // TODO: Decide what to do with this
        // /**
        //  * Personnel & material that may be requested
        //  */
        // const availablePersonnelAndMaterial = state.vehicleTemplates.map(
        //     (template) => ({
        //         vehicle: template.id,
        //         personnel: template.personnel.map(
        //             (thisPersonnel) => personnelTemplateMap[thisPersonnel]
        //         ),
        //         materials: template.materials,
        //     })
        // );

        const greenGrid = positionWalkableOrGreenPatients(
            state,
            viewport,
            patientIdsToCaterFor
        );

        const nonWalkablesToPretriage = pretriage(
            state,
            viewport,
            patientIdsToCaterFor,
            presentAvailableCateringPersonnelIds
        );

        if (nonWalkablesToPretriage) {
            // There are still non-walkable patients to pretriage.
            // Do nothing more.
            return;
        }

        const materialDistribution = getMaterialDistribution(
            state,
            patientIdsToCaterFor,
            presentAvailableCateringMaterialIds
        );

        const axisResult = buildMaterialAxis(
            state,
            viewport,
            patientIdsToCaterFor,
            presentAvailableCateringPersonnelIds,
            presentAvailableCateringMaterialIds,
            materialDistribution
        );

        const personnelDistribution = treatGreenPatients(
            state,
            viewport,
            patientIdsToCaterFor,
            presentAvailableCateringPersonnelIds,
            presentAvailableCateringMaterialIds,
            greenGrid,
            axisResult,
            materialDistribution
        );

        placeRemainingPersonnel(
            state,
            presentAvailableCateringPersonnelIds,
            patientIdsToCaterFor,
            personnelDistribution
        );

        transferredAPatient = transportPatient(
            state,
            viewport,
            vehicleIds,
            presentAvailableCateringPersonnelIds,
            patientIdsToCaterFor
        );
    } while (transferredAPatient);
}
