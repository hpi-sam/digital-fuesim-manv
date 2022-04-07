import { produce } from 'immer';
import { generateDummyPatient } from '../../data';
import type { Patient } from '../../models';
import { Material, Personnel } from '../../models';
import type { PatientStatus } from '../../models/utils';
import { CanCaterFor, Position } from '../../models/utils';
import type { ExerciseState } from '../../state';
import { generateExercise } from '../../state';
import type { Mutable, UUID, UUIDSet } from '../../utils';
import { uuid } from '../../utils';
import { calculateTreatments } from './calculate-treatments';

// TODO: https://github.com/hpi-sam/digital-fuesim-manv/issues/212

const emptyState = generateExercise();

interface Catering {
    /**
     * The id of the material or personnel catering
     */
    catererId: UUID;
    catererType: 'materials' | 'personnel';
    /**
     * All patients treated by {@link catererId}
     */
    patientIds: UUID[];
}

function assertCatering(
    beforeState: ExerciseState,
    newState: ExerciseState,
    caterings: Catering[]
) {
    const shouldState = produce(newState, (draftState) => {
        caterings.forEach((catering) => {
            const expectedAssignedPatients: UUIDSet = {};
            catering.patientIds.forEach((patientId) => {
                expectedAssignedPatients[patientId] = true;
            });
            expect(
                newState[catering.catererType][catering.catererId]
                    .assignedPatientIds
            ).toStrictEqual(expectedAssignedPatients);
            draftState[catering.catererType][
                catering.catererId
            ].assignedPatientIds = {};
        });
        const patientIds = caterings.flatMap((catering) => catering.patientIds);
        patientIds.forEach((patientId) => {
            expect(newState.patients[patientId].isBeingTreated).toStrictEqual(
                true
            );
            draftState.patients[patientId].isBeingTreated = false;
        });
        return draftState;
    });
    expect(shouldState).toStrictEqual(beforeState);
}

function generatePatient(
    visibleStatus: PatientStatus,
    realStatus: PatientStatus,
    position?: Position
): Mutable<Patient> {
    const patient = generateDummyPatient() as Mutable<Patient>;
    patient.visibleStatus = visibleStatus;
    patient.realStatus = realStatus;
    if (position) {
        patient.position = { ...position };
    }
    return patient;
}

function generatePersonnel(position?: Position) {
    const personnel = { ...new Personnel(uuid(), 'notSan', {}) };
    if (position) {
        personnel.position = { ...position };
    }
    return personnel;
}

function generateMaterial(position?: Position) {
    const material = {
        ...new Material(uuid(), {}, new CanCaterFor(1, 2, 3, 'or')),
    };
    if (position) {
        material.position = { ...position };
    }
    return material;
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
                state.personnel[person.id] = person;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only personnel outside vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const person = generatePersonnel(new Position(0, 0));
                state.personnel[person.id] = person;
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
                const material = generateMaterial(new Position(0, 0));
                state.materials[material.id] = material;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there are only non-dead patients', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                (['green', 'yellow', 'red'] as PatientStatus[]).forEach(
                    (color) => {
                        const patient = generatePatient(
                            color,
                            color,
                            new Position(0, 0)
                        );
                        state.patients[patient.id] = patient;
                    }
                );
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there are only dead patients', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const patient = generatePatient(
                    'black',
                    'black',
                    new Position(0, 0)
                );
                state.patients[patient.id] = patient;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when all personnel is in a vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const patient = generatePatient(
                    'green',
                    'green',
                    new Position(0, 0)
                );
                state.patients[patient.id] = patient;

                const person = generatePersonnel();
                state.personnel[person.id] = person;
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when all material is in a vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const patient = generatePatient(
                    'green',
                    'green',
                    new Position(0, 0)
                );
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
                const greenPatient = generatePatient(
                    'green',
                    'green',
                    new Position(0, 0)
                );
                const redPatient = generatePatient(
                    'red',
                    'red',
                    new Position(2, 2)
                );
                const material = generateMaterial(new Position(0, 0));

                ids.material = material.id;
                ids.greenPatient = greenPatient.id;
                ids.redPatient = redPatient.id;
                state.patients[greenPatient.id] = greenPatient;
                state.patients[redPatient.id] = redPatient;
                state.materials[material.id] = material;
            }
        );
        assertCatering(beforeState, newState, [
            {
                catererId: ids.material,
                catererType: 'materials',
                patientIds: [ids.greenPatient],
            },
        ]);
    });

    it('treats the patient with worse status within the generalThreshold, regardless of distance', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const greenPatient = generatePatient(
                    'green',
                    'green',
                    new Position(-1, -1)
                );
                const redPatient = generatePatient(
                    'red',
                    'red',
                    new Position(2, 2)
                );
                const material = generateMaterial(new Position(0, 0));

                ids.material = material.id;
                ids.greenPatient = greenPatient.id;
                ids.redPatient = redPatient.id;
                state.patients[greenPatient.id] = greenPatient;
                state.patients[redPatient.id] = redPatient;
                state.materials[material.id] = material;
            }
        );
        assertCatering(beforeState, newState, [
            {
                catererId: ids.material,
                catererType: 'materials',
                patientIds: [ids.redPatient],
            },
        ]);
    });

    it('treats no patients when all are out of reach', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const greenPatient = generatePatient(
                    'green',
                    'green',
                    new Position(-10, -10)
                );
                const redPatient = generatePatient(
                    'red',
                    'red',
                    new Position(20, 20)
                );
                const material = generateMaterial(new Position(0, 0));

                ids.material = material.id;
                ids.greenPatient = greenPatient.id;
                ids.redPatient = redPatient.id;
                state.patients[greenPatient.id] = greenPatient;
                state.patients[redPatient.id] = redPatient;
                state.materials[material.id] = material;
            }
        );
        assertCatering(beforeState, newState, []);
    });

    it('treats both patients when there is capacity', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                const greenPatient = generatePatient(
                    'green',
                    'green',
                    new Position(-1, -1)
                );
                const redPatient = generatePatient(
                    'red',
                    'red',
                    new Position(2, 2)
                );
                const material = generateMaterial(new Position(0, 0));
                material.canCaterFor = { ...new CanCaterFor(1, 0, 1, 'and') };

                ids.material = material.id;
                ids.greenPatient = greenPatient.id;
                ids.redPatient = redPatient.id;
                state.patients[greenPatient.id] = greenPatient;
                state.patients[redPatient.id] = redPatient;
                state.materials[material.id] = material;
            }
        );
        assertCatering(beforeState, newState, [
            {
                catererId: ids.material,
                catererType: 'materials',
                patientIds: [ids.redPatient, ids.greenPatient],
            },
        ]);
    });
});
