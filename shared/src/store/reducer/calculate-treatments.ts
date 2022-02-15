import type {
    ExerciseState,
    Material,
    Patient,
    Personell,
    Position,
} from '../..';
import type { Mutable } from '../../utils/immutability';

function calculateDistance(a: Position, b: Position) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

interface CatersFor {
    red: number;
    yellow: number;
    green: number;
}

/**
 * Maximum distance to treat the exact nearest patient
 */
const specificThreshold = 0.5;

/**
 * Maximum distance to treat any patient
 */
const generalThreshold = 5;

function caterFor(
    catering: Material | Personell,
    catersFor: CatersFor,
    patient: Patient
) {
    const color = patient.visibleStatus ?? 'yellow'; // Treat not pretriaged patients as yellow.
    if (
        (color === 'red' && catering.canCaterFor.red - catersFor.red <= 0) ||
        (color === 'yellow' &&
            catering.canCaterFor.yellow - catersFor.yellow <= 0) ||
        (color === 'green' && catering.canCaterFor.green - catersFor.green <= 0)
    ) {
        // Capacity for the color of the patient is no longer there.
        return false;
    }
    if (
        catering.canCaterFor.logicalOperator === 'or' &&
        ((color === 'red' && catersFor.yellow + catersFor.green > 0) ||
            (color === 'yellow' && catersFor.red + catersFor.green > 0) ||
            (color === 'green' && catersFor.yellow + catersFor.red > 0))
    ) {
        // We are already treating someone of another category and cannot treat multiple categories.
        return false;
    }
    catering.assignedPatientIds = {
        ...catering.assignedPatientIds,
        [patient.id]: true,
    };

    switch (color) {
        case 'red':
            catersFor.red++;
            break;
        case 'yellow':
            catersFor.yellow++;
            break;
        case 'green':
            catersFor.green++;
            break;
        default:
            break;
    }
    return true;
}

export function calculateTreatments(state: Mutable<ExerciseState>) {
    const personnels = Object.values(state.personell).filter(
        (personnel) => personnel.position !== undefined
    );
    const materials = Object.values(state.materials);
    // Unassign all patients as we are calculating everything from scratch.
    personnels.forEach((personnel) => {
        personnel.assignedPatientIds = {};
    });
    materials.forEach((material) => {
        material.assignedPatientIds = {};
    });
    const patients = Object.values(state.patients).filter(
        (patient) =>
            patient.position !== undefined && patient.visibleStatus !== 'black'
    );
    if (patients.length === 0) {
        // Don't treat anyone. No one (alive) is there.
        return;
    }
    // Currently, it is ignored whether a patient is already treated
    // and the patient is just added to the list of treated patients.
    personnels.forEach((personnel) => {
        calculateCatering(personnel, patients);
    });
    materials.forEach((material) => {
        calculateCatering(material, patients);
    });
}

function calculateCatering(
    catering: Material | Personell,
    patients: Patient[]
) {
    const catersFor: CatersFor = {
        red: 0,
        yellow: 0,
        green: 0,
    };
    const distances = patients
        .map(
            (patient) =>
                [
                    calculateDistance(catering.position!, patient.position!),
                    patient,
                ] as [number, Patient]
        )
        .filter((distance) => distance[0] <= generalThreshold)
        .sort((a, b) => a[0] - b[0]);
    if (distances.length === 0) {
        // No patients in the radius.
        return;
    }
    if (distances[0][0] <= specificThreshold) {
        caterFor(catering, catersFor, distances[0][1]);
    }
    const distancesByColor = groupBy(
        distances,
        (item) => item[1].visibleStatus ?? 'yellow' // Treat untriaged patients as yellow
    );
    distancesByColor.red
        ?.sort((a, b) => a[0] - b[0])
        .map((x) => x[1])
        .forEach((patient) => {
            caterFor(catering, catersFor, patient);
        });
    distancesByColor.yellow
        ?.sort((a, b) => a[0] - b[0])
        .map((x) => x[1])
        .forEach((patient) => {
            caterFor(catering, catersFor, patient);
        });
    distancesByColor.green
        ?.sort((a, b) => a[0] - b[0])
        .map((x) => x[1])
        .forEach((patient) => {
            caterFor(catering, catersFor, patient);
        });
}

// Source: https://stackoverflow.com/a/62765924
const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        if (!previous[group]) previous[group] = [];
        previous[group].push(currentItem);
        return previous;
        // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/prefer-reduce-type-parameter
    }, {} as Record<K, T[]>);
