import { renameDeleteTransferAction10 } from './10-rename-delete-transfer-action';
import { addMapImageIsLocked11 } from './11-add-map-image-is-locked';
import { renameIncorrectPatientImages12 } from './12-rename-incorrect-patient-images';
import { addMapImageZIndex13 } from './13-add-map-image-zindex';
import { addPersonnelAndMaterialToState14 } from './14-add-personnel-and-material-templates-to-state';
import { addSimulatedRegions15 } from './15-add-simulated-regions';
import { addMetaPosition16 } from './16-add-meta-position';
import { addTypeProperty17 } from './17-add-type-property';
import { replacePositionWithMetaPosition18 } from './18-replace-position-with-meta-position';
import { renameStartPointTypes19 } from './19-rename-start-point-types';
import { addSimulationProperties20 } from './20-add-simulation-properties';
import { fixTypoInRenameSimulatedRegion21 } from './21-fix-typo-in-rename-simulated-region';
import { removeIllegalVehicleMovementActions22 } from './22-remove-illegal-vehicle-movement-actions';
import { addTransferPointToSimulatedRegion23 } from './23-add-transfer-point-to-simulated-region';
import { addRadiograms24 } from './24-add-radiograms';
import { addPatientStatusTags25 } from './25-add-patient-status-tags';
import { addSimulatedRegionBorderColor26 } from './26-add-border-color-to-simulated-region';
import { addOccupationToVehicles27 } from './27-add-occupation-to-vehicles';
import { activitiesToUnloadVehiclesBehavior28 } from './28-add-activities-to-unload-vehicles-behavior';
import { removeTransferVehiclesActivityAndChangeAnswerRequestBehavior29 } from './29-remove-transfer-vehicles-activity-and-change-answer-request-behavior';
import { updateEocLog3 } from './3-update-eoc-log';
import { reportTreatmentStatusChanges30 } from './30-report-treatment-status-changes';
import { improveLoadVehicleActivity31 } from './31-improve-load-vehicle-activity';
import { removeIdFromEvents32 } from './32-remove-id-from-events';
import { reportTransferCategoryCompleted33 } from './33-report-transfer-category-completed';
import { addCatchAllHospital34 } from './34-add-catch-all-hospital';
import { removeSetParticipantIdAction4 } from './4-remove-set-participant-id-action';
import { removeStatistics5 } from './5-remove-statistics';
import { removeStateHistory6 } from './6-remove-state-history';
import { addPatientRemarks7 } from './7-add-patient-remarks';
import { treatmentSystemImprovements8 } from './8-treatment-system-improvements';
import { removeIsBeingTreated9 } from './9-remove-is-being-treated';
import { impossibleMigration } from './impossible-migration';

/**
 * Migrate a single action
 * @param intermediaryState - The migrated exercise state just before the action is applied
 * @param action - The action to migrate in place
 * @returns true if the migration was successful or false to indicate that the action should be deleted
 * @throws a {@link RestoreError} when a migration is not possible.
 */
type MigrateActionFunction = (
    intermediaryState: object,
    action: object
) => boolean;

/**
 * Such a function gets the not yet migrated state and is expected to mutate it to a migrated version.
 * It may throw a {@link RestoreError} when a migration is not possible.
 */
type MigrateStateFunction = (state: object) => void;

export interface Migration {
    action: MigrateActionFunction | null;
    state: MigrateStateFunction | null;
}

export const migrations: {
    [TargetStateVersion: number]: Migration;
} = {
    2: impossibleMigration,
    3: updateEocLog3,
    4: removeSetParticipantIdAction4,
    5: removeStatistics5,
    6: removeStateHistory6,
    7: addPatientRemarks7,
    8: treatmentSystemImprovements8,
    9: removeIsBeingTreated9,
    10: renameDeleteTransferAction10,
    11: addMapImageIsLocked11,
    12: renameIncorrectPatientImages12,
    13: addMapImageZIndex13,
    14: addPersonnelAndMaterialToState14,
    15: addSimulatedRegions15,
    16: addMetaPosition16,
    17: addTypeProperty17,
    18: replacePositionWithMetaPosition18,
    19: renameStartPointTypes19,
    20: addSimulationProperties20,
    21: fixTypoInRenameSimulatedRegion21,
    22: removeIllegalVehicleMovementActions22,
    23: addTransferPointToSimulatedRegion23,
    24: addRadiograms24,
    25: addPatientStatusTags25,
    26: addSimulatedRegionBorderColor26,
    27: addOccupationToVehicles27,
    28: activitiesToUnloadVehiclesBehavior28,
    29: removeTransferVehiclesActivityAndChangeAnswerRequestBehavior29,
    30: reportTreatmentStatusChanges30,
    31: improveLoadVehicleActivity31,
    32: removeIdFromEvents32,
    33: reportTransferCategoryCompleted33,
    34: addCatchAllHospital34,
};
