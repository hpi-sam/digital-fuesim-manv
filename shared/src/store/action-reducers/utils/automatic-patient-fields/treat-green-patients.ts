import type { Personnel, Viewport } from '../../../../models';
import { Patient } from '../../../../models';
import type { Size } from '../../../../models/utils';
import type { ExerciseState } from '../../../../state';
import type { Mutable, UUID } from '../../../../utils';
import { ReducerError } from '../../../reducer-error';
import type {
    AxisResult,
    MaterialDistribution,
    PersonnelDistribution,
    WithPosition,
} from './utils';
import {
    calculateGrid,
    spacing,
    offset,
    canCater,
    removeFromArray,
} from './utils';

export function positionWalkableOrGreenPatients(
    state: Mutable<ExerciseState>,
    viewport: Viewport,
    patientIds: UUID[]
): Size {
    const patients = patientIds.map((patientId) => state.patients[patientId]);
    const walkablePatients = patients.filter(
        (patient) =>
            (patient.pretriageInformation.isWalkable &&
                Patient.getVisibleStatus(
                    patient,
                    state.configuration.pretriageEnabled,
                    state.configuration.bluePatientsEnabled
                ) === 'white') ||
            Patient.getVisibleStatus(
                patient,
                state.configuration.pretriageEnabled,
                state.configuration.bluePatientsEnabled
            ) === 'green'
    );
    if (walkablePatients.length === 0) {
        return { width: 0, height: 0 };
    }
    const gridSize = calculateGrid(walkablePatients.length);
    // Make room for spacing
    const spacedGrid = {
        x: gridSize.width * spacing.x,
        y: gridSize.height * spacing.y,
    };
    if (
        viewport.size.width < spacedGrid.x ||
        viewport.size.height < spacedGrid.y
    ) {
        throw new ReducerError(
            `Cannot create walkable area in viewport ${viewport.id}`
        );
    }
    const gridTopLeft = {
        x: viewport.position.x + viewport.size.width * offset,
        y: viewport.position.y - viewport.size.height * offset,
    };
    walkablePatients.forEach((patient, index) => {
        patient.position = {
            x: gridTopLeft.x + (index % gridSize.width) * spacing.x,
            y: gridTopLeft.y - Math.floor(index / gridSize.width) * spacing.y,
        };
    });
    return gridSize;
}

export function treatGreenPatients(
    state: Mutable<ExerciseState>,
    viewport: Viewport,
    patientIds: UUID[],
    personnelIds: UUID[],
    materialIds: UUID[],
    patientGrid: Size,
    axisResult: AxisResult,
    materialDistribution: MaterialDistribution
): PersonnelDistribution {
    const patients = patientIds
        .map((patientId) => state.patients[patientId])
        .filter(
            (patient) =>
                Patient.getVisibleStatus(
                    patient,
                    state.configuration.pretriageEnabled,
                    state.configuration.bluePatientsEnabled
                ) === 'green'
        ) as Mutable<WithPosition<Patient>>[];
    const personnelDistribution = positionPersonnel(
        state,
        viewport,
        patients,
        personnelIds,
        patientGrid,
        axisResult
    );
    positionMaterial(state, patients, materialIds, materialDistribution);
    return personnelDistribution;
}

function positionPersonnel(
    state: Mutable<ExerciseState>,
    viewport: Viewport,
    patients: WithPosition<Patient>[],
    personnelIds: UUID[],
    patientGrid: Size,
    axisResult: AxisResult
): PersonnelDistribution {
    const personnelDistribution: PersonnelDistribution = {
        green: 0,
        outerAxis:
            axisResult.personnel.outerLeftLineCount +
            axisResult.personnel.outerRightLineCount,
    };
    const usedPersonnel =
        axisResult.personnel.outerLeftLineCount +
        axisResult.personnel.outerRightLineCount;
    const allPersonnel = personnelIds
        .map((personnelId) => state.personnel[personnelId])
        .filter(canCater)
        // Take the last patients.length personnel that are still available, or the first unused personnel
        .slice(
            Math.min(-patients.length, -(personnelIds.length - usedPersonnel))
        ) as Mutable<WithPosition<Personnel>>[];
    let takePersonnelFromAxis = Math.max(
        0,
        patients.length - (personnelIds.length - usedPersonnel)
    );
    const usePersonnel = (thisPersonnel: WithPosition<Personnel>) => {
        personnelDistribution.green++;
        if (takePersonnelFromAxis-- > 0) personnelDistribution.outerAxis--;
    };
    const personnel = allPersonnel
        // Never take more than patient.length personnel
        .slice(0, patients.length);
    if (personnel.length === 0 || patients.length === 0) {
        return personnelDistribution;
    }
    // Place the personnel in a grid inside the patients
    const personnelGrid = {
        width: patientGrid.width - 1,
        height: patientGrid.height - 1,
    };
    if (personnelGrid.width === 0 || personnelGrid.height === 0) {
        // Grid is very small. Just place personnel next to the patients
        personnel.forEach((thisPersonnel, index) => {
            thisPersonnel.position = {
                x: patients[index].position.x + 0.5 * spacing.x,
                y: patients[index].position.y,
            };
            usePersonnel(thisPersonnel);
        });
        return personnelDistribution;
    }
    const relevantPersonnel = allPersonnel
        .slice(
            Math.min(
                -(personnelGrid.width * personnelGrid.height),
                -(personnelIds.length - usedPersonnel)
            )
        )
        // Never take more than grid squares personnel
        .slice(0, personnelGrid.width * personnelGrid.height);
    const gridTopLeft = {
        x: viewport.position.x + viewport.size.width * offset + spacing.x * 0.5,
        y:
            viewport.position.y -
            viewport.size.height * offset -
            spacing.y * 0.5,
    };
    relevantPersonnel.forEach((thisPersonnel, index) => {
        thisPersonnel.position = {
            x: gridTopLeft.x + (index % personnelGrid.width) * spacing.x,
            y:
                gridTopLeft.y -
                Math.floor(index / personnelGrid.width) * spacing.y,
        };
        usePersonnel(thisPersonnel);
    });
    return personnelDistribution;
}

function positionMaterial(
    state: Mutable<ExerciseState>,
    patients: WithPosition<Patient>[],
    materialIds: UUID[],
    materialDistribution: MaterialDistribution
): void {
    const materials = materialIds
        .map((materialId) => state.materials[materialId])
        .slice(0, materialDistribution.green)
        .slice(0, patients.length);
    materials.forEach((material, index) => {
        material.position = {
            x: patients[index].position.x,
            y: patients[index].position.y - spacing.y * 0.3,
        };
        removeFromArray(materialIds, material.id);
    });
}
