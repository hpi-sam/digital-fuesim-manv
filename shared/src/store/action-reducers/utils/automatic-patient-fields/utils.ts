import { Patient, Viewport } from '../../../../models';
import type {
    CanCaterFor,
    PatientStatus,
    PersonnelType,
    Position,
    Size,
} from '../../../../models/utils';
import type { ExerciseState } from '../../../../state';
import type { UUID } from '../../../../utils';

export interface Positioned {
    position: Position;
}

export type WithPosition<T> = Positioned & T;

export interface MaterialDistribution {
    axis: number;
    green: number;
}

export interface AxisInformation {
    top: Position;
    steps: number;
    length: number;
    distanceFromCenter: number;
}

export interface PersonnelOnAxis {
    innerLeftLineCount: number;
    innerRightLineCount: number;
    outerLeftLineCount: number;
    outerRightLineCount: number;
}

export interface PatientsOnAxis {
    leftLineCount: number;
    rightLineCount: number;
}

export interface MaterialOnAxis {
    count: number;
}

export interface AxisResult {
    personnel: PersonnelOnAxis;
    patients: PatientsOnAxis;
    material: MaterialOnAxis;
}

export interface PersonnelDistribution {
    green: number;
    outerAxis: number;
}

/**
 * The minimum distance between patients, personnel and material
 */
export const spacing = { x: 2, y: 4 } as const;
/**
 * The minimum distance between vehicles
 */
export const vehicleSpacing = { x: spacing.x * 6, y: spacing.y * 1.5 } as const;
/**
 * The factor of the respective dimension how far patients must be placed from the edges.
 */
export const offset = 0.05 as const;
/**
 * How many material per axis step are required before green patients get material
 */
export const materialDistributionFactor = 4 as const;

/**
 * Removes the first occurrence of {@link valueToRemove} from an array by mutating it, returning the mutated array
 * @param array The array to mutate
 * @param valueToRemove The value to remove
 * @returns The mutated array
 */
export function removeFromArray<T>(array: T[], valueToRemove: T): T[] {
    const index = array.indexOf(valueToRemove);
    if (index < 0) {
        return array;
    }
    array.splice(index, 1);
    return array;
}

export function isNotPretriaged(
    state: ExerciseState,
    patient: Patient
): boolean {
    return (
        Patient.getVisibleStatus(
            patient,
            state.configuration.pretriageEnabled,
            state.configuration.bluePatientsEnabled
        ) === 'white'
    );
}

export function getMaterialDistribution(
    state: ExerciseState,
    patientIds: UUID[],
    materialIds: UUID[]
): MaterialDistribution {
    const patients = patientIds.map((patientId) => state.patients[patientId]);
    const numberOfYellowAndRedPatients = patients.filter((patient) =>
        ['yellow', 'red'].includes(
            Patient.getVisibleStatus(
                patient,
                state.configuration.pretriageEnabled,
                state.configuration.bluePatientsEnabled
            )
        )
    ).length;
    const numberOfGreenPatients = patients.filter(
        (patient) =>
            Patient.getVisibleStatus(
                patient,
                state.configuration.pretriageEnabled,
                state.configuration.bluePatientsEnabled
            ) === 'green'
    ).length;
    const numberOfMaterial = materialIds.length;
    const axisSteps = Math.ceil(numberOfYellowAndRedPatients / 2);
    const minimalMaterialAtAxis = materialDistributionFactor * axisSteps;
    const materialForGreen = Math.min(
        Math.max(0, numberOfMaterial - minimalMaterialAtAxis),
        numberOfGreenPatients
    );
    const materialAtAxis =
        minimalMaterialAtAxis +
        Math.max(
            0,
            numberOfMaterial - minimalMaterialAtAxis - materialForGreen
        );
    return {
        axis: materialAtAxis,
        green: materialForGreen,
    };
}

export function calculateGrid(totalSize: number): Size {
    const flooredRoot = Math.floor(Math.sqrt(totalSize));
    return { height: flooredRoot, width: Math.ceil(totalSize / flooredRoot) };
}

export function canCater(caterer: { canCaterFor: CanCaterFor }): boolean {
    return (
        caterer.canCaterFor.red +
            caterer.canCaterFor.yellow +
            caterer.canCaterFor.green >
        0
    );
}

export function compareCaterer(
    left: { canCaterFor: CanCaterFor; personnelType?: PersonnelType },
    right: { canCaterFor: CanCaterFor; personnelType?: PersonnelType }
): number {
    if (left.canCaterFor.red > right.canCaterFor.red) return -1;
    if (left.canCaterFor.red < right.canCaterFor.red) return 1;
    if (left.canCaterFor.yellow > right.canCaterFor.yellow) return -1;
    if (left.canCaterFor.yellow < right.canCaterFor.yellow) return 1;
    if (left.canCaterFor.green > right.canCaterFor.green) return -1;
    if (left.canCaterFor.green < right.canCaterFor.green) return 1;
    if (
        left.canCaterFor.logicalOperator !== right.canCaterFor.logicalOperator
    ) {
        return left.canCaterFor.logicalOperator === 'and' ? -1 : 1;
    }
    if (left.personnelType !== undefined && right.personnelType !== undefined) {
        if (left.personnelType === right.personnelType) return 0;
        if (left.personnelType === 'notarzt') return -1;
        if (right.personnelType === 'notarzt') return 1;
        if (left.personnelType === 'notSan') return -1;
        if (right.personnelType === 'notSan') return 1;
        if (left.personnelType === 'rettSan') return -1;
        if (right.personnelType === 'rettSan') return 1;
        if (left.personnelType === 'san') return -1;
        if (right.personnelType === 'san') return 1;
    }
    return 0;
}

export function getComparePatients(
    state: ExerciseState,
    treatWhiteAs: Exclude<PatientStatus, 'white'>
): (left: Patient, right: Patient) => number {
    return (left: Patient, right: Patient): number => {
        let leftStatus = Patient.getVisibleStatus(
            left,
            state.configuration.pretriageEnabled,
            state.configuration.bluePatientsEnabled
        );
        let rightStatus = Patient.getVisibleStatus(
            right,
            state.configuration.pretriageEnabled,
            state.configuration.bluePatientsEnabled
        );
        if (leftStatus === 'white') leftStatus = treatWhiteAs;
        if (rightStatus === 'white') rightStatus = treatWhiteAs;
        if (leftStatus === rightStatus) return 0;
        if (leftStatus === 'red') return -1;
        if (rightStatus === 'red') return 1;
        if (leftStatus === 'yellow') return -1;
        if (rightStatus === 'yellow') return 1;
        if (leftStatus === 'green') return -1;
        if (rightStatus === 'green') return 1;
        if (leftStatus === 'blue') return -1;
        if (rightStatus === 'blue') return 1;
        if (leftStatus === 'black') return -1;
        if (rightStatus === 'black') return 1;
        return 0 as never;
    };
}

export function assureCanCater(caterer: { canCaterFor: CanCaterFor }): boolean {
    return (
        caterer.canCaterFor.green > 0 ||
        caterer.canCaterFor.yellow > 0 ||
        caterer.canCaterFor.red > 0
    );
}

export function getElementIdsFromState<
    T extends { position?: Position; id: UUID }
>(
    state: ExerciseState,
    viewport: Viewport,
    type: 'materials' | 'patients' | 'personnel',
    additionalCondition?: (element: T) => boolean,
    additionalSort?: (left: T, right: T) => number
): UUID[] {
    return (Object.values(state[type]) as T[])
        .filter(
            (element) =>
                element.position !== undefined &&
                Viewport.isInViewport(viewport, element.position) &&
                (additionalCondition === undefined ||
                    additionalCondition(element))
        )
        .sort((a, b) => a.id.localeCompare(b.id))
        .sort(additionalSort ?? ((_left: T, _right: T) => 0))
        .map((element) => element.id);
}
