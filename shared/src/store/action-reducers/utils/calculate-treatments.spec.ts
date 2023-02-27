import { produce } from 'immer';
import type { PatientStatus } from '../../../models/utils';
import { CanCaterFor, MapCoordinates } from '../../../models/utils';
import { MapPosition } from '../../../models/utils/position/map-position';
import { VehiclePosition } from '../../../models/utils/position/vehicle-position';
import { ExerciseState } from '../../../state';
import type { Mutable } from '../../../utils';
import { cloneDeepMutable } from '../../../utils';
import { addMaterial } from '../../../../tests/utils/materials.spec';
import { addPatient } from '../../../../tests/utils/patients.spec';
import { addPersonnel } from '../../../../tests/utils/personnel.spec';
import { assertCatering } from '../../../../tests/utils/catering.spec';
import { updateTreatments } from './calculate-treatments';

const emptyState = ExerciseState.create('123456');

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
