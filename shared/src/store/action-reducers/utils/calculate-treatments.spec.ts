import { produce } from 'immer';
import { generateDummyPatient } from '../../../data';
import { defaultMaterialTemplates } from '../../../data/default-state/material-templates';
import { defaultPersonnelTemplates } from '../../../data/default-state/personnel-templates';
import type { Patient } from '../../../models';
import { Material, Personnel } from '../../../models';
import type { Position, PatientStatus } from '../../../models/utils';
import {
    currentCoordinatesOf,
    isPositionOnMap,
    CanCaterFor,
    MapCoordinates,
} from '../../../models/utils';
import { MapPosition } from '../../../models/utils/position/map-position';
import { SpatialTree } from '../../../models/utils/spatial-tree';
import { VehiclePosition } from '../../../models/utils/position/vehicle-position';
import { ExerciseState } from '../../../state';
import type { Mutable, UUID } from '../../../utils';
import { cloneDeepMutable, uuid } from '../../../utils';
import { updateTreatments } from './calculate-treatments';
import { getElement } from './get-element';

const emptyState = ExerciseState.create('123456');

interface Catering {
    /**
     * The id of the material or personnel catering
     */
    catererId: UUID;
    catererType: 'material' | 'personnel';
    /**
     * All patients treated by {@link catererId}
     */
    patientIds: UUID[];
}

/**
 * Asserts that adding the specified {@link caterings} to the {@link beforeState} results in the {@link newState}.
 * If the {@link beforeState} has already caterings in it, these will not be removed.
 */
function assertCatering(
    beforeState: ExerciseState,
    newState: ExerciseState,
    caterings: Catering[]
) {
    // Add all caterings to the before state and look whether the result is the newState
    const shouldState = produce(beforeState, (draftState) => {
        for (const catering of caterings) {
            // Update all the patients
            const patients = catering.patientIds.map((patientId) =>
                getElement(draftState, 'patient', patientId)
            );
            for (const patient of patients) {
                patient[
                    catering.catererType === 'material'
                        ? 'assignedMaterialIds'
                        : 'assignedPersonnelIds'
                ][catering.catererId] = true;
            }
            // Update the catering element
            const cateringElement = getElement(
                draftState,
                catering.catererType,
                catering.catererId
            );
            for (const patientId of catering.patientIds) {
                cateringElement.assignedPatientIds[patientId] = true;
            }
        }
        return draftState;
    });
    expect(newState).toStrictEqual(shouldState);
}

function addPatient(
    state: Mutable<ExerciseState>,
    pretriageStatus: PatientStatus,
    realStatus: PatientStatus,
    position?: MapCoordinates
): Mutable<Patient> {
    const patient = cloneDeepMutable(generateDummyPatient());
    patient.pretriageStatus = pretriageStatus;
    patient.realStatus = realStatus;
    if (position) {
        patient.position = {
            type: 'coordinates',
            coordinates: cloneDeepMutable(position),
        };
        SpatialTree.addElement(
            state.spatialTrees.patients,
            patient.id,
            position
        );
    }
    state.patients[patient.id] = patient;
    return patient;
}

function addPersonnel(state: Mutable<ExerciseState>, position: Position) {
    const personnel = cloneDeepMutable(
        Personnel.generatePersonnel(
            defaultPersonnelTemplates.notSan,
            uuid(),
            'RTW 3/83/1',
            position
        )
    );
    personnel.canCaterFor = {
        red: 1,
        yellow: 0,
        green: 0,
        logicalOperator: 'and',
    };
    if (isPositionOnMap(position)) {
        SpatialTree.addElement(
            state.spatialTrees.personnel,
            personnel.id,
            currentCoordinatesOf(personnel)
        );
    }
    state.personnel[personnel.id] = personnel;
    return personnel;
}

function addMaterial(state: Mutable<ExerciseState>, position: Position) {
    const material = cloneDeepMutable(
        Material.generateMaterial(
            defaultMaterialTemplates.standard,
            uuid(),
            'RTW 3/83/1',
            position
        )
    );
    material.canCaterFor = {
        red: 1,
        yellow: 0,
        green: 0,
        logicalOperator: 'and',
    };
    if (isPositionOnMap(position)) {
        SpatialTree.addElement(
            state.spatialTrees.materials,
            material.id,
            currentCoordinatesOf(material)
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
                addPersonnel(state, VehiclePosition.create(''));
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only personnel outside vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addPersonnel(state, VehiclePosition.create(''));
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only material in vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addMaterial(state, MapPosition.create({ x: 0, y: 0 }));
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there is only material outside vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addMaterial(state, MapPosition.create({ x: 0, y: 0 }));
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there are only non-dead patients', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                (['green', 'yellow', 'red'] as PatientStatus[]).forEach(
                    (color) => {
                        addPatient(
                            state,
                            color,
                            color,
                            MapCoordinates.create(0, 0)
                        );
                    }
                );
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when there are only dead patients', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addPatient(
                    state,
                    'black',
                    'black',
                    MapCoordinates.create(0, 0)
                );
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when all personnel is in a vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addPatient(
                    state,
                    'green',
                    'green',
                    MapCoordinates.create(0, 0)
                );
                addPersonnel(state, VehiclePosition.create(''));
            }
        );
        expect(newState).toStrictEqual(beforeState);
    });

    it('does nothing when all material is in a vehicle', () => {
        const { beforeState, newState } = setupStateAndApplyTreatments(
            (state) => {
                addPatient(
                    state,
                    'green',
                    'green',
                    MapCoordinates.create(0, 0)
                );
                addMaterial(state, VehiclePosition.create(''));
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
                    MapCoordinates.create(0, 0)
                ).id;
                ids.redPatient = addPatient(
                    state,
                    'red',
                    'red',
                    MapCoordinates.create(2, 2)
                ).id;
                ids.material = addMaterial(
                    state,
                    MapPosition.create({ x: 0, y: 0 })
                ).id;
            }
        );
        assertCatering(beforeState, newState, [
            {
                catererId: ids.material,
                catererType: 'material',
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
                    MapCoordinates.create(-3, -3)
                ).id;
                ids.redPatient = addPatient(
                    state,
                    'red',
                    'red',
                    MapCoordinates.create(3, 3)
                ).id;
                ids.material = addMaterial(
                    state,
                    MapPosition.create({ x: 0, y: 0 })
                ).id;
            }
        );
        assertCatering(beforeState, newState, [
            {
                catererId: ids.material,
                catererType: 'material',
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
                    MapCoordinates.create(-10, -10)
                ).id;
                ids.redPatient = addPatient(
                    state,
                    'red',
                    'red',
                    MapCoordinates.create(20, 20)
                ).id;
                ids.material = addMaterial(
                    state,
                    MapPosition.create({ x: 0, y: 0 })
                ).id;
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
                    MapCoordinates.create(-1, -1)
                ).id;
                ids.redPatient = addPatient(
                    state,
                    'red',
                    'red',
                    MapCoordinates.create(2, 2)
                ).id;
                const material = addMaterial(
                    state,
                    MapPosition.create({ x: 0, y: 0 })
                );
                material.canCaterFor = cloneDeepMutable(
                    CanCaterFor.create(1, 0, 1, 'and')
                );
                ids.material = material.id;
            }
        );
        assertCatering(beforeState, newState, [
            {
                catererId: ids.material,
                catererType: 'material',
                patientIds: [ids.redPatient, ids.greenPatient],
            },
        ]);
    });
});
