import { produce } from 'immer';
import { Material, Patient, Personell } from '../../models';
import type { PatientStatus } from '../../models/utils';
import { CanCaterFor, Position } from '../../models/utils';
import { PersonalInformation } from '../../models/utils/personal-information';
import type { ExerciseState } from '../../state';
import { generateExercise } from '../../state';
import type { Mutable } from '../../utils';
import { uuid } from '../../utils';
import { calculateTreatments } from './calculate-treatments';

// TODO: https://github.com/hpi-sam/digital-fuesim-manv/issues/212

const emptyState = generateExercise();

let patientCounter = 1;

function generatePatient(
    visibleStatus: PatientStatus,
    actualStatus: PatientStatus
) {
    return {
        ...new Patient(
            new PersonalInformation(
                'John Doe',
                'none',
                'nothing',
                'today',
                Math.abs(Math.sin((patientCounter++) ** 2 * 99)) * 100,
                'male'
            ),
            visibleStatus,
            actualStatus,
            ''
        ),
    };
}

function generatePersonnel() {
    return { ...new Personell(uuid(), 'notSan', {}) };
}

function generateMaterial() {
    return { ...new Material(uuid(), {}, new CanCaterFor(1, 2, 3, 'or')) };
}

/**
 * Perform {@link mutateBeforeState} and then call `calculateTreatments`
 * @param mutateBeforeState A function that may be called on the default state before calling to `calculateTreatments`.
 * @returns The state before and after calling `calculateTreatments`
 */
function setupStateAndApplyTreatments(
    mutateBeforeState?: (state: Mutable<ExerciseState>) => void
) {
    const beforeState = produce(emptyState, (draftState) => {
        mutateBeforeState?.(draftState);
    });

    const newState = produce(beforeState, (draft) => {
        calculateTreatments(draft);
    });
    return {
        beforeState,
        newState,
    };
}

describe('calculate treatment', () => {
    it('does nothing when there is nothing', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments();
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only personnel in vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const person = generatePersonnel();
                state.personell[person.id] = person;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only personnel outside vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const person = generatePersonnel();
                person.position = { ...new Position(0, 0) };
                state.personell[person.id] = person;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only material in vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const material = generateMaterial();
                state.materials[material.id] = material;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only material outside vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const material = generateMaterial();
                material.position = { ...new Position(0, 0) };
                state.materials[material.id] = material;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there are only non-dead patients', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const patient = generatePatient('green', 'green');
                state.patients[patient.id] = patient;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there are only dead patients', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const patient = generatePatient('black', 'black');
                patient.position = { ...new Position(0, 0) };
                state.patients[patient.id] = patient;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when all personnel is in a vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const patient = generatePatient('green', 'green');
                patient.position = { ...new Position(0, 0) };
                state.patients[patient.id] = patient;

                const person = generatePersonnel();
                state.personell[person.id] = person;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when all material is in a vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const patient = generatePatient('green', 'green');
                patient.position = { ...new Position(0, 0) };
                state.patients[patient.id] = patient;

                const material = generateMaterial();
                state.materials[material.id] = material;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('treats the nearest patient within the specificThreshold, regardless of status', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const greenPatient = generatePatient('green', 'green');
                const redPatient = generatePatient('red', 'red');
                greenPatient.position = { ...new Position(0, 0) };
                redPatient.position = { ...new Position(2, 2) };
                const material = generateMaterial();
                material.position = { ...new Position(0, 0) };

                ids.material = material.id;
                ids.greenPatient = greenPatient.id;
                ids.redPatient = redPatient.id;
                state.patients[greenPatient.id] = greenPatient;
                state.patients[redPatient.id] = redPatient;
                state.materials[material.id] = material;
            }
        );
        expect(
            newState.materials[ids.material].assignedPatientIds
        ).toStrictEqual({
            [ids.greenPatient]: true,
        });
        // Only the assignedPatientIds should differ, therefore ignore them
        const should = {
            ...newState,
            materials: {
                ...newState.materials,
                [ids.material]: {
                    ...newState.materials[ids.material],
                    assignedPatientIds: {},
                },
            },
        };
        expect(should).toStrictEqual(beforeState);
    });

    it('treats the patient with worse status within the generalThreshold, regardless of distance', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const greenPatient = generatePatient('green', 'green');
                const redPatient = generatePatient('red', 'red');
                greenPatient.position = { ...new Position(-1, -1) };
                redPatient.position = { ...new Position(2, 2) };
                const material = generateMaterial();
                material.position = { ...new Position(0, 0) };

                ids.material = material.id;
                ids.greenPatient = greenPatient.id;
                ids.redPatient = redPatient.id;
                state.patients[greenPatient.id] = greenPatient;
                state.patients[redPatient.id] = redPatient;
                state.materials[material.id] = material;
            }
        );
        expect(
            newState.materials[ids.material].assignedPatientIds
        ).toStrictEqual({
            [ids.redPatient]: true,
        });
        // Only the assignedPatientIds should differ, therefore ignore them
        const should = {
            ...newState,
            materials: {
                ...newState.materials,
                [ids.material]: {
                    ...newState.materials[ids.material],
                    assignedPatientIds: {},
                },
            },
        };
        expect(should).toStrictEqual(beforeState);
    });

    it('treats no patients when all are out of reach', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const greenPatient = generatePatient('green', 'green');
                const redPatient = generatePatient('red', 'red');
                greenPatient.position = { ...new Position(-10, -10) };
                redPatient.position = { ...new Position(20, 20) };
                const material = generateMaterial();
                material.position = { ...new Position(0, 0) };

                ids.material = material.id;
                ids.greenPatient = greenPatient.id;
                ids.redPatient = redPatient.id;
                state.patients[greenPatient.id] = greenPatient;
                state.patients[redPatient.id] = redPatient;
                state.materials[material.id] = material;
            }
        );
        expect(
            newState.materials[ids.material].assignedPatientIds
        ).toStrictEqual({});
        // Only the assignedPatientIds should differ, therefore ignore them
        const should = {
            ...newState,
        };
        expect(should).toStrictEqual(beforeState);
    });

    it('treats both patients when there is capacity', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const greenPatient = generatePatient('green', 'green');
                const redPatient = generatePatient('red', 'red');
                greenPatient.position = { ...new Position(-1, -1) };
                redPatient.position = { ...new Position(2, 2) };
                const material = generateMaterial();
                material.canCaterFor = { ...new CanCaterFor(1, 0, 1, 'and') };
                material.position = { ...new Position(0, 0) };

                ids.material = material.id;
                ids.greenPatient = greenPatient.id;
                ids.redPatient = redPatient.id;
                state.patients[greenPatient.id] = greenPatient;
                state.patients[redPatient.id] = redPatient;
                state.materials[material.id] = material;
            }
        );
        expect(
            newState.materials[ids.material].assignedPatientIds
        ).toStrictEqual({
            [ids.redPatient]: true,
            [ids.greenPatient]: true,
        });
        // Only the assignedPatientIds should differ, therefore ignore them
        const should = {
            ...newState,
            materials: {
                ...newState.materials,
                [ids.material]: {
                    ...newState.materials[ids.material],
                    assignedPatientIds: {},
                },
            },
        };
        expect(should).toStrictEqual(beforeState);
    });
});
