import type { Viewport } from '../../../../models';
import { Patient } from '../../../../models';
import type { ExerciseState } from '../../../../state';
import type { Immutable, Mutable, UUID } from '../../../../utils';
import { cloneDeepMutable } from '../../../../utils';
import type {
    PersonnelOnAxis,
    PatientsOnAxis,
    MaterialOnAxis,
    AxisResult,
    MaterialDistribution,
    AxisInformation,
} from './utils';
import { spacing, offset, removeFromArray, getComparePatients } from './utils';

const emptyPersonnelResult: Immutable<PersonnelOnAxis> = {
    innerLeftLineCount: 0,
    innerRightLineCount: 0,
    outerLeftLineCount: 0,
    outerRightLineCount: 0,
} as const;

const emptyPatientResult: Immutable<PatientsOnAxis> = {
    leftLineCount: 0,
    rightLineCount: 0,
} as const;

const emptyMaterialResult: Immutable<MaterialOnAxis> = { count: 0 } as const;

const emptyAxisResult: Immutable<AxisResult> = {
    personnel: emptyPersonnelResult,
    patients: emptyPatientResult,
    material: emptyMaterialResult,
} as const;

export function buildMaterialAxis(
    state: Mutable<ExerciseState>,
    viewport: Viewport,
    patientIds: UUID[],
    personnelIds: UUID[],
    materialIds: UUID[],
    materialDistribution: MaterialDistribution
): AxisResult {
    // TODO: Verify that everything is still in the viewport after all this
    const relevantPatients = getPatientsForAxis(state, patientIds);
    if (relevantPatients.length === 0) {
        return emptyAxisResult;
    }

    const axisInformation = getAxisInformation(
        viewport,
        relevantPatients.length
    );
    const patientsOnAxis = positionPatientsOnAxis(
        relevantPatients,
        axisInformation
    );
    const materialOnAxis = positionMaterialOnAxis(
        state,
        materialIds,
        axisInformation,
        materialDistribution
    );
    const personnelOnAxis = positionPersonnelOnAxis(
        state,
        personnelIds,
        axisInformation
    );
    return {
        material: materialOnAxis,
        patients: patientsOnAxis,
        personnel: personnelOnAxis,
    };
}

function positionPersonnelOnAxis(
    state: Mutable<ExerciseState>,
    personnelIds: UUID[],
    axisInformation: AxisInformation
): PersonnelOnAxis {
    const result: PersonnelOnAxis = cloneDeepMutable(emptyPersonnelResult);
    const personnel = personnelIds
        .map((personnelId) => state.personnel[personnelId])
        .filter(
            (thisPersonnel) =>
                thisPersonnel.canCaterFor.red +
                    thisPersonnel.canCaterFor.yellow +
                    thisPersonnel.canCaterFor.green >
                0
        );

    // Place the personnel on four lines:
    // Two in-between the material and the patients (filled first)
    // Two outside of the patients (filled thereafter)
    // Those lines are shifted half a y-offset down (also filling the outer spots)

    const personnelForInnerLines = personnel.slice(
        0,
        (axisInformation.steps + 1) * 2
    );
    personnelForInnerLines.forEach((thisPersonnel, index) => {
        thisPersonnel.position = {
            x:
                axisInformation.top.x +
                axisInformation.distanceFromCenter *
                    0.5 *
                    (index % 2 === 0 ? 1 : -1),
            y:
                axisInformation.top.y -
                Math.floor(index / 2) * spacing.y +
                0.5 * spacing.y -
                // Minimally move personnel down to not have identical distances
                offset,
        };
        if (index % 2 === 0) result.innerRightLineCount++;
        else result.innerLeftLineCount++;
        removeFromArray(personnelIds, thisPersonnel.id);
    });

    const personnelForOuterLines = personnel.slice(
        (axisInformation.steps + 1) * 2,
        (axisInformation.steps + 1) * 2 * 2
    );
    personnelForOuterLines.forEach((thisPersonnel, index) => {
        thisPersonnel.position = {
            x:
                axisInformation.top.x +
                axisInformation.distanceFromCenter *
                    1.5 *
                    (index % 2 === 0 ? 1 : -1),
            y:
                axisInformation.top.y -
                Math.floor(index / 2) * spacing.y +
                0.5 * spacing.y -
                // Minimally move personnel done to not have identical distances
                offset,
        };
        if (index % 2 === 0) result.outerRightLineCount++;
        else result.outerLeftLineCount++;
        // Do not lock personnel in the outer lines
        // removeFromArray(personnelIds, thisPersonnel.id);
    });
    return result;
}

function positionMaterialOnAxis(
    state: Mutable<ExerciseState>,
    materialIds: UUID[],
    axisInformation: AxisInformation,
    materialDistribution: MaterialDistribution
): MaterialOnAxis {
    const materials = materialIds
        .map((materialId) => state.materials[materialId])
        .slice(0, materialDistribution.axis);
    // Fill top spots first, or when enough is there, equally space material
    const distanceBetweenMaterial =
        spacing.y *
        (materials.length < axisInformation.steps || materials.length === 1
            ? 1
            : (axisInformation.steps - 1) / (materials.length - 1));
    materials.forEach((material, index) => {
        material.position = {
            // Minimally "wobble" x-axis to treat patients on both sides
            x: axisInformation.top.x + offset * (index % 2 === 0 ? 1 : -1),
            y: axisInformation.top.y - index * distanceBetweenMaterial,
        };
        removeFromArray(materialIds, material.id);
    });
    return { count: materials.length };
}

function positionPatientsOnAxis(
    patients: Mutable<Patient>[],
    axisInformation: AxisInformation
): PatientsOnAxis {
    const result: PatientsOnAxis = cloneDeepMutable(emptyPatientResult);
    patients.forEach((patient, index) => {
        patient.position = {
            x:
                axisInformation.top.x +
                axisInformation.distanceFromCenter * (index % 2 === 0 ? 1 : -1),
            y: axisInformation.top.y - Math.floor(index / 2) * spacing.y,
        };
        if (index % 2 === 0) result.rightLineCount++;
        else result.leftLineCount++;
    });
    return result;
}

function getAxisInformation(
    viewport: Viewport,
    numberOfPatients: number
): AxisInformation {
    const infos = {
        top: {
            x: viewport.position.x + 0.5 * viewport.size.width,
            y: viewport.position.y - viewport.size.height * offset,
        },
        steps: Math.ceil(numberOfPatients / 2),
        length: 0,
        distanceFromCenter: spacing.x * 2,
    };
    infos.length = infos.steps * spacing.y;
    return infos;
}

function getPatientsForAxis(
    state: Mutable<ExerciseState>,
    patientIds: UUID[]
): Mutable<Patient>[] {
    return patientIds
        .map((patientId) => state.patients[patientId])
        .filter((patient) =>
            // Only add yellow & red patients to the axis
            ['red', 'yellow'].includes(
                Patient.getVisibleStatus(
                    patient,
                    state.configuration.pretriageEnabled,
                    state.configuration.bluePatientsEnabled
                )
            )
        )
        .sort(getComparePatients(state, 'green'));
}
