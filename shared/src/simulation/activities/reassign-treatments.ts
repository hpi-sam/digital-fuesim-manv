import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import type { Material, Personnel } from '../../models';
import { Patient } from '../../models';
import type { PatientStatus, PersonnelType } from '../../models/utils';
import { getCreate, isInSpecificSimulatedRegion } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { CatersFor } from '../../store/action-reducers/utils/calculate-treatments';
import {
    couldCaterFor,
    removeTreatmentsOfElement,
    tryToCaterFor,
} from '../../store/action-reducers/utils/calculate-treatments';
import type { Mutable } from '../../utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
// Do not import from "../utils" since it would cause circular dependencies
import {
    TreatmentProgress,
    treatmentProgressAllowedValues,
} from '../utils/treatment';
import { TreatmentProgressChangedEvent } from '../events';
import { sendSimulationEvent } from '../events/utils';
import type { AssignLeaderBehaviorState } from '../behaviors/assign-leader';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class ReassignTreatmentsActivityState
    implements SimulationActivityState
{
    @IsValue('reassignTreatmentsActivity' as const)
    public readonly type = 'reassignTreatmentsActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsLiteralUnion(treatmentProgressAllowedValues)
    public readonly treatmentProgress: TreatmentProgress = 'unknown';

    @IsOptional()
    @IsInt()
    @Min(0)
    public readonly countingStartedAt: number | undefined;

    @IsInt()
    @Min(0)
    public readonly countingTimePerPatient: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        treatmentProgress: TreatmentProgress,
        countingTimePerPatient: number
    ) {
        this.id = id;
        this.treatmentProgress = treatmentProgress;
        this.countingTimePerPatient = countingTimePerPatient;
    }

    static readonly create = getCreate(this);
}

export const reassignTreatmentsActivity: SimulationActivity<ReassignTreatmentsActivityState> =
    {
        activityState: ReassignTreatmentsActivityState,
        tick(draftState, simulatedRegion, activityState, _, terminate) {
            const patients = Object.values(draftState.patients).filter(
                (patient) =>
                    isInSpecificSimulatedRegion(patient, simulatedRegion.id)
            );
            const personnel = Object.values(draftState.personnel).filter(
                (pers) =>
                    isInSpecificSimulatedRegion(pers, simulatedRegion.id) &&
                    pers.personnelType !== 'gf'
            );
            const materials = Object.values(draftState.materials).filter(
                (material) =>
                    isInSpecificSimulatedRegion(material, simulatedRegion.id)
            );

            patients.forEach((patient) =>
                removeTreatmentsOfElement(draftState, patient)
            );

            const leaderId = (
                simulatedRegion.behaviors.find(
                    (behavior) => behavior.type === 'assignLeaderBehavior'
                ) as AssignLeaderBehaviorState
            )?.leaderId;

            let leaderIndex: number;
            if (
                !leaderId ||
                (leaderIndex = personnel.findIndex(
                    (pers) => pers.id === leaderId
                ))
            ) {
                terminate();
                return;
            }

            // The leader does not treat patients
            personnel.splice(leaderIndex, 1);

            if (personnel.length === 0) {
                terminate();
                return;
            }

            let allowTerminate = true;

            switch (activityState.treatmentProgress) {
                case 'unknown': {
                    const finished = count(draftState, activityState, patients);
                    if (finished) {
                        sendSimulationEvent(
                            simulatedRegion,
                            TreatmentProgressChangedEvent.create('counted')
                        );
                    }
                    allowTerminate = finished;
                    break;
                }
                case 'counted': {
                    const finished = triage(
                        draftState,
                        patients,
                        personnel,
                        materials
                    );
                    if (finished) {
                        sendSimulationEvent(
                            simulatedRegion,
                            TreatmentProgressChangedEvent.create('triaged')
                        );
                    }
                    break;
                }
                case 'triaged':
                case 'secured': {
                    const secured = treat(
                        draftState,
                        patients,
                        personnel,
                        materials
                    );
                    if (
                        activityState.treatmentProgress === 'triaged' &&
                        secured
                    ) {
                        sendSimulationEvent(
                            simulatedRegion,
                            TreatmentProgressChangedEvent.create('secured')
                        );
                    }
                    break;
                }
                default:
                // Unknown state
            }

            if (allowTerminate) {
                terminate();
            }
        },
    };

interface CateringMaterial {
    material: Mutable<Material>;
    catersFor: CatersFor;
}

interface CateringPersonnel {
    personnel: Mutable<Personnel>;
    priority: number;
    catersFor: CatersFor;
}

function createCateringMaterial(
    materials: Mutable<Material>[]
): CateringMaterial[] {
    return materials.map((material) => ({
        material,
        catersFor: { red: 0, yellow: 0, green: 0 },
    }));
}

const personnelPriorities: { [Key in PersonnelType]: number } = {
    gf: 0,
    san: 1,
    rettSan: 2,
    notSan: 3,
    notarzt: 4,
};

function createCateringPersonnel(
    personnel: Mutable<Personnel>[]
): CateringPersonnel[] {
    return personnel.map((pers) => ({
        personnel: pers,
        priority: personnelPriorities[pers.personnelType],
        catersFor: {
            red: 0,
            yellow: 0,
            green: 0,
        },
    }));
}

/**
 * Performs the assignment logic for a stage in which the patients have to be counted.
 * @param draftState The state to operate in
 * @param activityState The state of the current activity
 * @param patients A list of the patients to operate on
 * @returns Whether all patients have been counted
 */
function count(
    draftState: Mutable<ExerciseState>,
    activityState: Mutable<ReassignTreatmentsActivityState>,
    patients: Mutable<Patient>[]
): boolean {
    if (activityState.countingStartedAt) {
        return (
            draftState.currentTime >=
            activityState.countingStartedAt +
                activityState.countingTimePerPatient * patients.length
        );
    }

    activityState.countingStartedAt = draftState.currentTime;
    return false;
}

/**
 * Performs the assignment logic for a stage in which the patients have to be triaged.
 * In this stage, triage is prioritized over treatment, meaning that even red patients might not be treated in order to triage all patients as fast as possible.
 * @param draftState The state to operate in
 * @param patients A list of the patients to operate on
 * @param personnel A list of the personnel to operate on
 * @param materials A list of the patients to operate on
 * @returns Whether all patients are triaged
 */
function triage(
    draftState: Mutable<ExerciseState>,
    patients: Mutable<Patient>[],
    personnel: Mutable<Personnel>[],
    materials: Mutable<Material>[]
): boolean {
    const cateringPersonnel = createCateringPersonnel(personnel).sort(
        (a, b) => a.priority - b.priority
    );

    const patientsToTreat: Mutable<Patient>[] = [];

    patients.forEach((patient) => {
        if (Patient.pretriageStatusIsLocked(patient)) {
            patientsToTreat.push(patient);
            return;
        }

        const triagePersonnelIndex = cateringPersonnel.findIndex(
            (pers) =>
                hasNoTreatments(pers) &&
                tryToCaterFor(
                    pers.personnel,
                    pers.catersFor,
                    patient,
                    draftState.configuration.pretriageEnabled,
                    draftState.configuration.bluePatientsEnabled
                )
        );

        if (triagePersonnelIndex !== -1) {
            // Personnel that is used for triage shall not be used for treatments
            cateringPersonnel.splice(triagePersonnelIndex, 1);
        }
    });

    assignTreatments(draftState, patientsToTreat, cateringPersonnel, materials);

    return patientsToTreat.length === patients.length;
}

/**
 * Performs the assignment logic for a stage in which the patients have to be treated for.
 * In this stage, patients are prioritized by their triage status.
 * @param draftState The state to operate in
 * @param patients A list of the patients to operate on
 * @param personnel A list of the personnel to operate on
 * @param materials A list of the patients to operate on
 * @returns Whether the treatment for all patients is secured.
 */
function treat(
    draftState: Mutable<ExerciseState>,
    patients: Mutable<Patient>[],
    personnel: Mutable<Personnel>[],
    materials: Mutable<Material>[]
): boolean {
    return assignTreatments(
        draftState,
        patients,
        createCateringPersonnel(personnel),
        materials
    );
}

/**
 * Groups an array by a property selected from an element.
 * @param array The array to group.
 * @param keySelector A function returning the grouping property for a given element.
 * @returns An object of keys mapped to arrays.
 */
function groupBy<T, K extends number | string | symbol>(
    array: T[],
    keySelector: (t: T) => K
): { [Key in K]?: T[] } {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const map = {} as { [Key in K]?: T[] };

    array.forEach((element) => {
        const key = keySelector(element);

        if (!map[key]) {
            map[key] = [];
        }

        map[key]!.push(element);
    });

    return map;
}

/**
 * Checks whether the `catersFor` property of the specified {@link cateringPersonnel} is set to zero for all statuses.
 */
function hasNoTreatments(cateringPersonnel: CateringPersonnel): boolean {
    return (
        cateringPersonnel.catersFor.red === 0 &&
        cateringPersonnel.catersFor.yellow === 0 &&
        cateringPersonnel.catersFor.green === 0
    );
}

/**
 * Checks whether the `catersFor` property of the specified {@link cateringPersonnel} is set to zero for all statuses higher than {@link status}.
 */
function hasNoHigherTreatments(
    cateringPersonnel: CateringPersonnel,
    status: Exclude<PatientStatus, 'black' | 'blue' | 'white'>
): boolean {
    if (status === 'green') {
        return (
            cateringPersonnel.catersFor.red === 0 &&
            cateringPersonnel.catersFor.yellow === 0
        );
    }

    if (status === 'yellow') return cateringPersonnel.catersFor.red === 0;

    return true;
}

/**
 * Determines the overall amount of patients the {@link cateringPersonnel} is treating.
 */
function sumOfTreatments(cateringPersonnel: CateringPersonnel): number {
    return (
        cateringPersonnel.catersFor.red +
        cateringPersonnel.catersFor.yellow +
        cateringPersonnel.catersFor.green
    );
}

/**
 * Selects the best personnel to treat a specific patient.
 * This function tries to find a personnel of the requested type and prefers personnel that is not treating any other patient.
 * If there is no personnel of the requested type (neither "exclusive" nor treating other patients but having some capacity left), the next higher type will be checked by the same pattern.
 * @param groupedPersonnel Available personnel, grouped by their personnelType
 * @param minType The minimum required personnel type for the patient
 * @param patientStatus The status of the patient
 * @param maxPatients The maximum number of patients the selected personnel may be treating after assigning the new patient
 * @param mixWithHigherStatus Whether the patient may be assigned to a personnel that is already treating patients with a more urgent status
 * @returns An object specifying the assignable personnel and whether the personnel is treating the current patient exclusively, if an assignable personnel was found.
 *  `undefined` otherwise.
 */
function findAssignablePersonnel(
    groupedPersonnel: {
        [Key in PersonnelType]?: CateringPersonnel[] | undefined;
    },
    minType: PersonnelType,
    patientStatus: Exclude<PatientStatus, 'black' | 'blue' | 'white'>,
    maxPatients: number,
    mixWithHigherStatus = true
): { personnel: CateringPersonnel; isExclusive: boolean } | undefined {
    const exclusivePersonnel = groupedPersonnel[minType]?.find((personnel) =>
        hasNoTreatments(personnel)
    );

    if (exclusivePersonnel) {
        return { personnel: exclusivePersonnel, isExclusive: true };
    }

    const availablePersonnel = groupedPersonnel[minType]?.find(
        (personnel) =>
            sumOfTreatments(personnel) < maxPatients &&
            couldCaterFor(
                patientStatus,
                personnel.personnel,
                personnel.catersFor
            ) &&
            (mixWithHigherStatus ||
                hasNoHigherTreatments(personnel, patientStatus))
    );

    if (availablePersonnel) {
        return { personnel: availablePersonnel, isExclusive: false };
    }

    switch (minType) {
        case 'gf':
            return findAssignablePersonnel(
                groupedPersonnel,
                'san',
                patientStatus,
                maxPatients,
                mixWithHigherStatus
            );
        case 'san':
            return findAssignablePersonnel(
                groupedPersonnel,
                'rettSan',
                patientStatus,
                maxPatients,
                mixWithHigherStatus
            );
        case 'rettSan':
            return findAssignablePersonnel(
                groupedPersonnel,
                'notSan',
                patientStatus,
                maxPatients,
                mixWithHigherStatus
            );
        case 'notSan':
            return findAssignablePersonnel(
                groupedPersonnel,
                'notarzt',
                patientStatus,
                maxPatients,
                mixWithHigherStatus
            );
        case 'notarzt':
            return undefined;
    }
}

/**
 * Performs the actual assignment of personnel and material to patients.
 * This function tries to reach matching in which every red patient is treated by a notSan and a rettSan exclusively, each yellow patient is treated by a rettSan exclusively and each two green patients are treated by a san.
 * Additionally, each red and yellow patient should be treated by a notarzt (non-exclusively) and material should be assigned.
 * @param draftState The state to operate in
 * @param patients A list of the patients to operate on
 * @param cateringPersonnel A list of the personnel to operate on.
 *  Personnel may be treating some other patients already, expressed by the catersFor property.
 * @param materials A list of the materials to operate on.
 * @returns Whether the treatment for all patients is secured.
 */
function assignTreatments(
    draftState: Mutable<ExerciseState>,
    patients: Mutable<Patient>[],
    cateringPersonnel: CateringPersonnel[],
    materials: Mutable<Material>[]
): boolean {
    const groupedPatients = groupBy(patients, (patient) =>
        Patient.getVisibleStatus(
            patient,
            draftState.configuration.pretriageEnabled,
            draftState.configuration.bluePatientsEnabled
        )
    );

    const groupedPersonnel = groupBy(
        cateringPersonnel,
        (personnel) => personnel.personnel.personnelType
    );

    let securedPatients = 0;

    groupedPatients.red?.forEach((patient) => {
        const assignableNotSan = findAssignablePersonnel(
            groupedPersonnel,
            'notSan',
            'red',
            2
        );

        if (assignableNotSan) {
            tryToCaterFor(
                assignableNotSan.personnel.personnel,
                assignableNotSan.personnel.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            );
        }

        const assignableRettSan = findAssignablePersonnel(
            groupedPersonnel,
            'rettSan',
            'red',
            2
        );

        if (assignableRettSan) {
            tryToCaterFor(
                assignableRettSan.personnel.personnel,
                assignableRettSan.personnel.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            );
        }

        if (assignableNotSan?.isExclusive && assignableRettSan?.isExclusive) {
            securedPatients++;
        }
    });

    groupedPatients.yellow?.forEach((patient) => {
        const assignableRettSan = findAssignablePersonnel(
            groupedPersonnel,
            'rettSan',
            'yellow',
            2
        );

        if (assignableRettSan) {
            tryToCaterFor(
                assignableRettSan.personnel.personnel,
                assignableRettSan.personnel.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            );

            if (assignableRettSan.isExclusive) {
                securedPatients++;
            }
        }
    });

    groupedPatients.green?.forEach((patient) => {
        const assignableSan = findAssignablePersonnel(
            groupedPersonnel,
            'san',
            'green',
            2,
            false
        );

        if (assignableSan) {
            tryToCaterFor(
                assignableSan.personnel.personnel,
                assignableSan.personnel.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            );

            // Green patients do not need individual treatment to be secured
            securedPatients++;
        }
    });

    const cateringMaterials = createCateringMaterial(materials);

    // A notarzt may be used to replace a lower tier personnel if there is not enough
    // In this case, we consider the notarzt to be more occupied that by it's normal work so we don't want to use them here
    const remainingNotarzts =
        groupedPersonnel.notarzt?.filter((notarzt) =>
            hasNoTreatments(notarzt)
        ) ?? [];

    let patientsWithNotarzt = 0;

    [
        ...(groupedPatients.red ?? []),
        ...(groupedPatients.yellow ?? []),
        ...(groupedPatients.green ?? []),
    ].forEach((patient) => {
        // More material does not lead to any benefit and the material does not have any different qualification/capabilities.
        // Therefore, we can just use this simple approach to assign the material, beginning by the most urgent patients.
        cateringMaterials.some((material) =>
            tryToCaterFor(
                material.material,
                material.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            )
        );

        if (
            Patient.getVisibleStatus(
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            ) !== 'green'
        ) {
            // Usually, notarzts are needed for some specific tasks, but they do not have to treat a patient continuously and exclusively.
            // Therefore, we can just use this simple approach based on their normal treatment capacity
            if (
                remainingNotarzts.some((notarzt) =>
                    tryToCaterFor(
                        notarzt.personnel,
                        notarzt.catersFor,
                        patient,
                        draftState.configuration.pretriageEnabled,
                        draftState.configuration.bluePatientsEnabled
                    )
                )
            ) {
                patientsWithNotarzt++;
            }
        }
    });

    const redAndYellowPatientsCount =
        (groupedPatients.red?.length ?? 0) +
        (groupedPatients.yellow?.length ?? 0);

    return (
        securedPatients >= patients.length &&
        patientsWithNotarzt >= redAndYellowPatientsCount
    );
}
