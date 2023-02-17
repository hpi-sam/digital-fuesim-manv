import { IsUUID } from 'class-validator';
import type { Material, Personnel } from '../../models';
import { Patient, SimulatedRegion } from '../../models';
import type { PatientStatus, PersonnelType } from '../../models/utils';
import { getCreate } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { CatersFor } from '../../store/action-reducers/utils/calculate-treatments';
import {
    removeTreatmentsOfElement,
    tryToCaterFor,
} from '../../store/action-reducers/utils/calculate-treatments';
import type { Mutable } from '../../utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { TreatPatientsBehaviorState } from '../behaviors';
import { TreatmentProgressChangedEvent } from '../events';
import { sendSimulationEvent } from '../utils';
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

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    constructor(id: UUID, behaviorId: UUID) {
        this.id = id;
        this.behaviorId = behaviorId;
    }

    static readonly create = getCreate(this);
}

export const reassignTreatmentsActivity: SimulationActivity<ReassignTreatmentsActivityState> =
    {
        activityState: ReassignTreatmentsActivityState,
        tick(draftState, simulatedRegion, activityState, _, terminate) {
            const treatBehavior = simulatedRegion.behaviors.find(
                (behavior) => behavior.id === activityState.behaviorId
            ) as Mutable<TreatPatientsBehaviorState> | undefined;

            if (!treatBehavior) {
                return;
            }

            const patients = Object.values(draftState.patients).filter(
                (patient) =>
                    SimulatedRegion.isInSimulatedRegion(
                        simulatedRegion,
                        patient
                    )
            );
            const personnel = Object.values(draftState.personnel).filter(
                (pers) =>
                    SimulatedRegion.isInSimulatedRegion(
                        simulatedRegion,
                        pers
                    ) && pers.personnelType !== 'gf'
            );
            const materials = Object.values(draftState.materials).filter(
                (material) =>
                    SimulatedRegion.isInSimulatedRegion(
                        simulatedRegion,
                        material
                    )
            );

            patients.forEach((patient) =>
                removeTreatmentsOfElement(draftState, patient)
            );

            if (personnel.length === 0) {
                return;
            }

            switch (treatBehavior.treatmentProgress) {
                case 'unknown': {
                    const finished = count(
                        draftState,
                        patients,
                        personnel,
                        materials
                    );
                    if (finished) {
                        sendSimulationEvent(
                            simulatedRegion,
                            TreatmentProgressChangedEvent.create('counted')
                        );
                    }
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
                case 'secured':
                    treat(draftState, patients, personnel, materials);
                    // TODO: if state is not yet secured, check whether we've secured it now and send event
                    break;
                default:
                // Unknown state
            }

            terminate();
        },
    };

interface CateringPersonnel {
    personnel: Mutable<Personnel>;
    priority: number;
    catersFor: CatersFor;
}

const personnelPriorities: { [Key in PersonnelType]: number } = {
    gf: 0,
    san: 1,
    rettSan: 2,
    notSan: 3,
    notarzt: 4,
};

const patientPriorities: { [Key in PatientStatus]: number } = {
    black: 0,
    blue: 1,
    green: 2,
    yellow: 3,
    red: 4,
    white: 5,
};

function createCateringPersonnel(
    personnel: Mutable<Personnel[]>
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
 * @param patients A list of the patients to operate on
 * @param personnel A list of the personnel to operate on
 * @param materials A list of the patients to operate on
 * @returns Whether all patients have been counted
 */
function count(
    draftState: Mutable<ExerciseState>,
    patients: Mutable<Patient>[],
    personnel: Mutable<Personnel>[],
    materials: Mutable<Material>[]
): boolean {
    // TODO: Find a good logic how to count patients and how long it should take
    return true;
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
 */
function treat(
    draftState: Mutable<ExerciseState>,
    patients: Mutable<Patient>[],
    personnel: Mutable<Personnel>[],
    materials: Mutable<Material>[]
) {
    assignTreatments(
        draftState,
        patients,
        createCateringPersonnel(personnel),
        materials
    );
}

/**
 * Performs the actual assignment of personnel to patients.
 * The patients will be matched to personnel by sorting patients based on their triage and personnel based on their skills and then starting from the most injured patient and the most skilled personnel.
 * @param draftState The state to operate in
 * @param patients A list of the patients to operate on
 * @param cateringPersonnel A list of the personnel to operate on.
 *  Each personnel has a priority assigned and personnel with higher priority is considered to be more skilled.
 *  Personnel may be treating some other patients already, expressed by the catersFor property.
 * @param materials A list of the materials to operate on.
 */
function assignTreatments(
    draftState: Mutable<ExerciseState>,
    patients: Mutable<Patient>[],
    cateringPersonnel: CateringPersonnel[],
    materials: Mutable<Material>[] // TODO: What about material? What effect does it have on the patients?
) {
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
    });
}
