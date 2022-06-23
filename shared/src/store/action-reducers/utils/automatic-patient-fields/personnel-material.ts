import type { Patient, Viewport } from '../../../../models';
import type { ExerciseState } from '../../../../state';
import type { Mutable, UUID } from '../../../../utils';
import type { Positioned, PersonnelDistribution, WithPosition } from './utils';
import { calculateGrid, spacing, offset, getComparePatients } from './utils';

export function initialPositioning(
    state: Mutable<ExerciseState>,
    viewport: Viewport,
    personnelIds: UUID[],
    materialIds: UUID[]
): void {
    const objectsToPosition = [
        ...personnelIds.map(
            (personnelId) => state.personnel[personnelId] as Mutable<Positioned>
        ),
        ...materialIds.map(
            (materialId) => state.materials[materialId] as Mutable<Positioned>
        ),
    ];
    if (objectsToPosition.length === 0) {
        return;
    }
    const gridSize = calculateGrid(objectsToPosition.length);
    // Make room for spacing
    const spacedGrid = {
        x: gridSize.width * spacing.x,
        y: gridSize.height * spacing.y,
    };
    if (
        viewport.size.width < spacedGrid.x ||
        viewport.size.height < spacedGrid.y
    ) {
        return;
    }
    const gridTopRight = {
        x:
            viewport.position.x +
            viewport.size.width -
            viewport.size.width * offset,
        y: viewport.position.y - viewport.size.height * offset,
    };
    objectsToPosition.forEach((object, index) => {
        object.position = {
            x: gridTopRight.x - (index % gridSize.width) * spacing.x,
            y: gridTopRight.y - Math.floor(index / gridSize.width) * spacing.y,
        };
    });
}

export function placeRemainingPersonnel(
    state: Mutable<ExerciseState>,
    personnelIds: UUID[],
    patientIds: UUID[],
    personnelDistribution: PersonnelDistribution
): void {
    const personnel = personnelIds
        .map((personnelId) => state.personnel[personnelId])
        // Do not modify the personnel on the axis or in-between the greens
        .slice(personnelDistribution.green + personnelDistribution.outerAxis);
    const patients = patientIds
        .map((patientId) => state.patients[patientId])
        .sort(getComparePatients(state, 'green'))
        .slice(0, personnel.length) as WithPosition<Patient>[];
    patients.forEach((patient, index) => {
        const thisPersonnel = personnel[index];
        thisPersonnel.position = {
            x: patient.position.x + 0.5 * spacing.x,
            y: patient.position.y,
        };
    });
}
