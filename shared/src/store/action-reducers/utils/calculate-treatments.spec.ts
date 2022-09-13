import { produce } from 'immer';
import { generateDummyPatient } from '../../../data';
import type { Patient } from '../../../models';
import { Material, Personnel } from '../../../models';
import type { PatientStatus } from '../../../models/utils';
import { CanCaterFor, Position } from '../../../models/utils';
import { SpatialTree } from '../../../models/utils/spatial-tree';
import { ExerciseState } from '../../../state';
import type { Mutable, UUID, UUIDSet } from '../../../utils';
import { cloneDeepMutable, uuid } from '../../../utils';
import { updateTreatments } from './calculate-treatments';

const emptyState = ExerciseState.create('123456');

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
            const expectedAssignedPatients: Mutable<UUIDSet> = {};
            catering.patientIds.forEach((patientId) => {
                expectedAssignedPatients[patientId] = true;
            });
            expect(
                newState[catering.catererType][catering.catererId]!
                    .assignedPatientIds
            ).toStrictEqual(expectedAssignedPatients);
            draftState[catering.catererType][
                catering.catererId
            ]!.assignedPatientIds = {};
        });
        const patientIds = caterings.flatMap((catering) => catering.patientIds);
        patientIds.forEach((patientId) => {
            expect(newState.patients[patientId]!.isBeingTreated).toStrictEqual(
                true
            );
            draftState.patients[patientId]!.isBeingTreated = false;
        });
        return draftState;
    });
    expect(shouldState).toStrictEqual(beforeState);
}

function addPatient(
    state: Mutable<ExerciseState>,
    pretriageStatus: PatientStatus,
    realStatus: PatientStatus,
    position?: Position
): Mutable<Patient> {
    const patient = cloneDeepMutable(generateDummyPatient());
    patient.pretriageStatus = pretriageStatus;
    patient.realStatus = realStatus;
    if (position) {
        patient.position = cloneDeepMutable(position);
        SpatialTree.addElement(
            state.spatialTrees.patients,
            patient.id,
            patient.position
        );
    }
    state.patients[patient.id] = patient;
    return patient;
}

function addPersonnel(state: Mutable<ExerciseState>, position?: Position) {
    const personnel = cloneDeepMutable(
        Personnel.create(uuid(), 'RTW 3/83/1', 'notSan', {})
    );
    if (position) {
        personnel.position = cloneDeepMutable(position);
        SpatialTree.addElement(
            state.spatialTrees.personnel,
            personnel.id,
            personnel.position
        );
    }
    state.personnel[personnel.id] = personnel;
    return personnel;
}

function addMaterial(state: Mutable<ExerciseState>, position?: Position) {
    const material = cloneDeepMutable(
        Material.create(uuid(), 'RTW 3/83/1', 'standard', {})
    );
    if (position) {
        material.position = cloneDeepMutable(position);
        SpatialTree.addElement(
            state.spatialTrees.materials,
            material.id,
            material.position
        );
    }
    state.materials[material.id] = material;
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
        for (const patient of Object.values(draft.patients)) {
            updateTreatments(draft, patient);
        }
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
                addPersonnel(state);
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only personnel outside vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addPersonnel(state, Position.create(0, 0));
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only material in vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addMaterial(state);
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only material outside vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addMaterial(state, Position.create(0, 0));
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there are only non-dead patients', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                (['green', 'yellow', 'red'] as PatientStatus[]).forEach(
                    (color) => {
                        addPatient(state, color, color, Position.create(0, 0));
                    }
                );
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there are only dead patients', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addPatient(state, 'black', 'black', Position.create(0, 0));
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when all personnel is in a vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addPatient(state, 'green', 'green', Position.create(0, 0));
                addPersonnel(state);
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when all material is in a vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addPatient(state, 'green', 'green', Position.create(0, 0));
                addMaterial(state);
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('treats the nearest patient within the overrideTreatmentRange, regardless of status', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                ids.greenPatient = addPatient(
                    state,
                    'green',
                    'green',
                    Position.create(0, 0)
                ).id;
                ids.redPatient = addPatient(
                    state,
                    'red',
                    'red',
                    Position.create(2, 2)
                ).id;
                ids.material = addMaterial(state, Position.create(0, 0)).id;
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

    it('treats the patient with worse status within the treatmentRange, regardless of distance', () => {
        const ids = {
            material: '',
            greenPatient: '',
            redPatient: '',
        };
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                ids.greenPatient = addPatient(
                    state,
                    'green',
                    'green',
                    Position.create(-1, -1)
                ).id;
                ids.redPatient = addPatient(
                    state,
                    'red',
                    'red',
                    Position.create(2, 2)
                ).id;
                ids.material = addMaterial(state, Position.create(0, 0)).id;
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
                ids.greenPatient = addPatient(
                    state,
                    'green',
                    'green',
                    Position.create(-10, -10)
                ).id;
                ids.redPatient = addPatient(
                    state,
                    'red',
                    'red',
                    Position.create(20, 20)
                ).id;
                ids.material = addMaterial(state, Position.create(0, 0)).id;
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
                ids.greenPatient = addPatient(
                    state,
                    'green',
                    'green',
                    Position.create(-1, -1)
                ).id;
                ids.redPatient = addPatient(
                    state,
                    'red',
                    'red',
                    Position.create(2, 2)
                ).id;
                const material = addMaterial(state, Position.create(0, 0));
                material.canCaterFor = cloneDeepMutable(
                    CanCaterFor.create(1, 0, 1, 'and')
                );
                ids.material = material.id;
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
