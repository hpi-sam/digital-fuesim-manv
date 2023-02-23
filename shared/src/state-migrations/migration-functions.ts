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
import { updateEocLog3 } from './3-update-eoc-log';
import { removeSetParticipantIdAction4 } from './4-remove-set-participant-id-action';
import { removeStatistics5 } from './5-remove-statistics';
import { removeStateHistory6 } from './6-remove-state-history';
import { addPatientRemarks7 } from './7-add-patient-remarks';
import { treatmentSystemImprovements8 } from './8-treatment-system-improvements';
import { removeIsBeingTreated9 } from './9-remove-is-being-treated';
import { impossibleMigration } from './impossible-migration';

/**
 * Such a function gets the already migrated initial state of the exercise and an array of all actions (not yet migrated).
 * It is expected that afterwards the actions in the provided array are migrated.
 * It is not allowed to modify the order of the actions, to add an action or to remove an action.
 * To indicate that an action should be removed it can be replaced by `null`.
 * It may throw a {@link RestoreError} when a migration is not possible.
 */
type MigrateActionsFunction = (
    initialState: object,
    actions: (object | null)[]
) => void;

/**
 * Such a function gets the not yet migrated state and is expected to mutate it to a migrated version.
 * It may throw a {@link RestoreError} when a migration is not possible.
 */
type MigrateStateFunction = (state: object) => void;

export interface Migration {
    actions: MigrateActionsFunction | null;
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
};
