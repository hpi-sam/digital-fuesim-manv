import type {
    ExerciseState,
    ImageProperties,
    Mutable,
} from 'digital-fuesim-manv-shared';
import {
    cloneDeepMutable,
    SpatialTree,
    StrictObject,
} from 'digital-fuesim-manv-shared';
import type { Migration } from './migrations';

export const treatmentSystemImprovements8: Migration = {
    actions: (_initialState, actions: any[]) => {
        for (const action of actions) {
            switch (action?.type) {
                case '[Vehicle] Add vehicle':
                    for (const material of action.materials) {
                        migrateMaterial(material);
                    }
                    for (const personnel of action.personnel) {
                        migratePersonnel(personnel);
                    }
                    break;
                case '[Patient] Add patient':
                    migratePatient(action.patient);
                    break;
            }
        }
    },
    state: (state: any) => {
        // Spatial tree
        state.spatialTrees = cloneDeepMutable({
            materials: SpatialTree.create(),
            patients: SpatialTree.create(),
            personnel: SpatialTree.create(),
        });
        for (const material of StrictObject.values(state.materials)) {
            migrateMaterial(material);
            if (!material.position) {
                continue;
            }
            SpatialTree.addElement(
                state.spatialTrees.materials,
                material.id,
                material.position
            );
        }
        for (const personnel of StrictObject.values(state.personnel)) {
            migratePersonnel(personnel);
            if (!personnel.position) {
                continue;
            }
            SpatialTree.addElement(
                state.spatialTrees.personnel,
                personnel.id,
                personnel.position
            );
        }
        // Migrate patients
        for (const patient of StrictObject.values(state.patients)) {
            migratePatient(patient);
            for (const personnel of StrictObject.values(state.personnel)) {
                if (personnel.assignedPatientIds[patient.id]) {
                    patient.assignedPersonnelIds[personnel.id] = true;
                }
            }
            for (const material of StrictObject.values(state.materials)) {
                if (material.assignedPatientIds[patient.id]) {
                    patient.assignedMaterialIds[material.id] = true;
                }
            }
            if (!patient.position) {
                continue;
            }
            SpatialTree.addElement(
                state.spatialTrees.patients,
                patient.id,
                patient.position
            );
        }
        // VehicleTemplates
        for (const vehicleTemplate of state.vehicleTemplates) {
            vehicleTemplate.materials = vehicleTemplate.materials.map(
                () => 'standard'
            );
        }
        // PatientCategories
        for (const patientCategory of state.patientCategories as Mutable<
            ExerciseState['patientCategories']
        >) {
            migrateImageProperties(patientCategory.image);
        }
        return state;
    },
};

function migrateMaterial(material: any) {
    material.overrideTreatmentRange = 0.5;
    material.treatmentRange = 5;
}

function migratePersonnel(personnel: any) {
    personnel.overrideTreatmentRange = 0.5;
    personnel.treatmentRange = 5;
}

function migratePatient(patient: any) {
    migrateImageProperties(patient.image);
    patient.assignedPersonnelIds = {};
    patient.assignedMaterialIds = {};
}

function migrateImageProperties(image: Mutable<ImageProperties>) {
    if (image.url === '/assets/male-patient.svg') {
        image.url = '/assets/patient.svg';
    }
}
