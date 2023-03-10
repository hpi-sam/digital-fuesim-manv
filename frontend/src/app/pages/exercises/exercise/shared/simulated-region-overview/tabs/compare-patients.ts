import type {
    ExerciseConfiguration,
    PatientStatus,
} from 'digital-fuesim-manv-shared';
import { Patient } from 'digital-fuesim-manv-shared';

const patientCategoryOrderDictionary: {
    [Key in PatientStatus]: number;
} = {
    black: 5,
    blue: 4,
    green: 3,
    red: 1,
    white: 0,
    yellow: 2,
};

/**
 * Compares two patients according to their visible status with more urgent statuses (white > red > yellow > green > blue > black) first
 * @param patientA The first patient to compare
 * @param patientB The second patient to compare
 * @param configuration The current exercise configuration
 * @returns A negative value, if `patientA` < `patientB`, zero, if the patients are both equally urgent, and a positive number otherwise
 */
export function comparePatientsByVisibleStatus(
    patientA: Patient,
    patientB: Patient,
    configuration: ExerciseConfiguration
): number {
    let statusA!: PatientStatus;
    let statusB!: PatientStatus;

    if (patientA === undefined) {
        statusA = 'white';
    } else {
        statusA = Patient.getVisibleStatus(
            patientA,
            configuration.pretriageEnabled,
            configuration.bluePatientsEnabled
        );
    }
    if (patientB === undefined) {
        statusB = 'white';
    } else {
        statusB = Patient.getVisibleStatus(
            patientB,
            configuration.pretriageEnabled,
            configuration.bluePatientsEnabled
        );
    }

    const valueA = patientCategoryOrderDictionary[statusA];
    const valueB = patientCategoryOrderDictionary[statusB];
    return valueA !== valueB
        ? valueA - valueB
        : patientCategoryOrderDictionary[patientA.realStatus] -
              patientCategoryOrderDictionary[patientB.realStatus];
}
