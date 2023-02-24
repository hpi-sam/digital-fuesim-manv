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
import { patientPriorities, personnelPriorities } from '../utils/priorities';
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
    public readonly id!: UUID;

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

            if (personnel.length === 0) {
                return;
            }

            const leaderId = (
                simulatedRegion.behaviors.find(
                    (behavior) => behavior.type === 'assignLeaderBehavior'
                ) as AssignLeaderBehaviorState
            )?.leaderId;

            if (!leaderId) {
                return;
            }

            // The leader does not treat patients
            personnel.splice(
                personnel.findIndex((pers) => pers.id === leaderId),
                1
            );

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

        cateringPersonnel.some((pers) =>
            tryToCaterFor(
                pers.personnel,
                pers.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            )
        );
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

function groupBy<T, K extends number | string | symbol>(
    array: T[],
    keySelector: (t: T) => K
): { [Key in K]: T[] | undefined } {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const map = {} as { [Key in K]: T[] | undefined };

    array.forEach((element) => {
        const key = keySelector(element);

        if (!map[key]) {
            map[key] = [];
        }

        map[key]!.push(element);
    });

    return map;
}

function hasNoTreatments(cateringPersonnel: CateringPersonnel): boolean {
    return (
        cateringPersonnel.catersFor.red === 0 &&
        cateringPersonnel.catersFor.yellow === 0 &&
        cateringPersonnel.catersFor.green === 0
    );
}

function sumOfTreatments(cateringPersonnel: CateringPersonnel): number {
    return (
        cateringPersonnel.catersFor.red +
        cateringPersonnel.catersFor.yellow +
        cateringPersonnel.catersFor.green
    );
}

function findAssignablePersonnel(
    groupedPersonnel: {
        [Key in PersonnelType]: CateringPersonnel[] | undefined;
    },
    minType: PersonnelType,
    patientStatus: Exclude<PatientStatus, 'white'>,
    maxPatients: number
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
            )
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
                maxPatients
            );
        case 'san':
            return findAssignablePersonnel(
                groupedPersonnel,
                'rettSan',
                patientStatus,
                maxPatients
            );
        case 'rettSan':
            return findAssignablePersonnel(
                groupedPersonnel,
                'notSan',
                patientStatus,
                maxPatients
            );
        case 'notSan':
            return findAssignablePersonnel(
                groupedPersonnel,
                'notarzt',
                patientStatus,
                maxPatients
            );
        case 'notarzt':
            return undefined;
    }
}

/**
 * TODO: Update this comment to reflect the new behavior
 * Performs the actual assignment of personnel to patients.
 * The patients will be matched to personnel by sorting patients based on their triage and personnel based on their skills and then starting from the most injured patient and the most skilled personnel.
 * @param draftState The state to operate in
 * @param patients A list of the patients to operate on
 * @param cateringPersonnel A list of the personnel to operate on.
 *  Each personnel has a priority assigned and personnel with higher priority is considered to be more skilled.
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
        const notSanResult = findAssignablePersonnel(
            groupedPersonnel,
            'notSan',
            'red',
            2
        );

        if (notSanResult) {
            tryToCaterFor(
                notSanResult.personnel.personnel,
                notSanResult.personnel.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            );
        }

        const rettSanResult = findAssignablePersonnel(
            groupedPersonnel,
            'rettSan',
            'red',
            2
        );

        if (rettSanResult) {
            tryToCaterFor(
                rettSanResult.personnel.personnel,
                rettSanResult.personnel.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            );
        }

        if (notSanResult?.isExclusive && rettSanResult?.isExclusive) {
            securedPatients++;
        }
    });

    groupedPatients.yellow?.forEach((patient) => {
        const rettSanResult = findAssignablePersonnel(
            groupedPersonnel,
            'rettSan',
            'yellow',
            2
        );

        if (rettSanResult) {
            tryToCaterFor(
                rettSanResult.personnel.personnel,
                rettSanResult.personnel.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            );

            if (rettSanResult.isExclusive) {
                securedPatients++;
            }
        }
    });

    groupedPatients.green?.forEach((patient) => {
        // TODO: Green patients must not take treatment capacity from yellow or red patients
        const sanResult = findAssignablePersonnel(
            groupedPersonnel,
            'san',
            'green',
            2
        );

        if (sanResult) {
            tryToCaterFor(
                sanResult.personnel.personnel,
                sanResult.personnel.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            );

            // Green patients do not need individual treatment to be secured
            securedPatients++;
        }
    });

    // TODO: Assign material...
    // TODO: Assign paramedics 4:1-5:1

    // TODO: Check for paramedics here, too
    return securedPatients >= patients.length;

    // TODO: Remove old code
    const cateringMaterials = createCateringMaterial(materials);
    patients.sort(
        (a, b) =>
            patientPriorities[
                Patient.getVisibleStatus(
                    b,
                    draftState.configuration.pretriageEnabled,
                    draftState.configuration.bluePatientsEnabled
                )
            ] -
            patientPriorities[
                Patient.getVisibleStatus(
                    a,
                    draftState.configuration.pretriageEnabled,
                    draftState.configuration.bluePatientsEnabled
                )
            ]
    );
    cateringPersonnel.sort((a, b) => b.priority - a.priority);

    patients.forEach((patient) => {
        cateringPersonnel.some((pers) =>
            tryToCaterFor(
                pers.personnel,
                pers.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            )
        );
        cateringMaterials.some((material) =>
            tryToCaterFor(
                material.material,
                material.catersFor,
                patient,
                draftState.configuration.pretriageEnabled,
                draftState.configuration.bluePatientsEnabled
            )
        );
    });
}
