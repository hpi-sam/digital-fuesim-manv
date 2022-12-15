import type {
    UUID,
    StateExport,
    Mutable,
    ExerciseAction,
} from 'digital-fuesim-manv-shared';
import {
    cloneDeepMutable,
    ExerciseState,
    applyAllActions,
} from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { RestoreError } from '../../utils/restore-error';
import { ActionWrapperEntity } from '../entities/action-wrapper.entity';
import { ExerciseWrapperEntity } from '../entities/exercise-wrapper.entity';
import { addMapImageZIndex13 } from './13-add-map-image-zindex';
import { updateEocLog3 } from './3-update-eoc-log';
import { removeSetParticipantIdAction4 } from './4-remove-set-participant-id-action';
import { removeStatistics5 } from './5-remove-statistics';
import { removeStateHistory6 } from './6-remove-state-history';
import { addPatientRemarks7 } from './7-add-patient-remarks';
import { treatmentSystemImprovements8 } from './8-treatment-system-improvements';
import { removeIsBeingTreated9 } from './9-remove-is-being-treated';
import { renameDeleteTransferAction10 } from './10-rename-delete-transfer-action';
import { addMapImageIsLocked11 } from './11-add-map-image-is-locked';
import { renameIncorrectPatientImages12 } from './12-rename-incorrect-patient-images';
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

// TODO: It'd probably be better not to export this
export const migrations: {
    [key: number]: Migration;
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
};

export async function migrateInDatabase(
    exerciseId: UUID,
    entityManager: EntityManager
): Promise<void> {
    const exercise = await entityManager.findOne(ExerciseWrapperEntity, {
        where: { id: exerciseId },
    });
    if (exercise === null) {
        throw new RestoreError(
            'Cannot find exercise to convert in database',
            exerciseId
        );
    }
    const initialState = JSON.parse(exercise.initialStateString);
    const currentState = JSON.parse(exercise.currentStateString);
    const actions = (
        await entityManager.find(ActionWrapperEntity, {
            where: { exercise: { id: exerciseId } },
            select: { actionString: true },
            order: { index: 'ASC' },
        })
    ).map((action) => JSON.parse(action.actionString));
    const newVersion = applyMigrations(exercise.stateVersion, {
        currentState,
        history: {
            initialState,
            actions,
        },
    });
    exercise.stateVersion = newVersion;
    // Save exercise wrapper
    const patch: Partial<ExerciseWrapperEntity> = {
        stateVersion: exercise.stateVersion,
    };
    patch.initialStateString = JSON.stringify(initialState);
    patch.currentStateString = JSON.stringify(currentState);
    await entityManager.update(
        ExerciseWrapperEntity,
        { id: exerciseId },
        patch
    );
    // Save actions
    if (actions !== undefined) {
        let patchedActionsIndex = 0;
        const indicesToRemove: number[] = [];
        const actionsToUpdate: {
            previousIndex: number;
            newIndex: number;
            actionString: string;
        }[] = [];
        actions.forEach((action, i) => {
            if (action === null) {
                indicesToRemove.push(i);
                return;
            }
            actionsToUpdate.push({
                previousIndex: i,
                newIndex: patchedActionsIndex++,
                actionString: JSON.stringify(action),
            });
        });
        if (indicesToRemove.length > 0) {
            await entityManager
                .createQueryBuilder()
                .delete()
                .from(ActionWrapperEntity)
                // eslint-disable-next-line unicorn/string-content
                .where('index IN (:...ids)', { ids: indicesToRemove })
                .execute();
        }
        if (actionsToUpdate.length > 0) {
            await Promise.all(
                actionsToUpdate.map(
                    async ({ previousIndex, newIndex, actionString }) =>
                        entityManager.update(
                            ActionWrapperEntity,
                            {
                                index: previousIndex,
                                exercise: { id: exerciseId },
                            },
                            { actionString, index: newIndex }
                        )
                )
            );
        }
    }
}

export function migrateStateExport(
    stateExportToMigrate: StateExport
): Mutable<StateExport> {
    const stateExport = cloneDeepMutable(stateExportToMigrate);
    const propertiesToMigrate = {
        currentState: stateExport.currentState,
        history: stateExport.history
            ? {
                  initialState: stateExport.history.initialState,
                  actions: stateExport.history.actionHistory,
              }
            : undefined,
    };
    const newVersion = applyMigrations(
        stateExport.dataVersion,
        propertiesToMigrate
    );
    stateExport.dataVersion = newVersion;
    stateExport.currentState = propertiesToMigrate.currentState;
    if (stateExport.history) {
        stateExport.history.actionHistory =
            // Remove actions that are marked to be removed by the migrations
            propertiesToMigrate.history!.actions.filter(
                (action) => action !== null
            );
    }
    return stateExport;
}

/**
 * Migrates {@link propertiesToMigrate} to the newest version ({@link ExerciseState.currentStateVersion})
 * by mutating them.
 *
 * @returns The new state version
 */
function applyMigrations(
    currentStateVersion: number,
    propertiesToMigrate: {
        currentState: object;
        history?: { initialState: object; actions: (object | null)[] };
    }
): number {
    const targetVersion = ExerciseState.currentStateVersion;
    for (let i = currentStateVersion + 1; i <= targetVersion; i++) {
        const stateMigration = migrations[i]!.state;
        if (stateMigration !== null) {
            if (propertiesToMigrate.history)
                stateMigration(propertiesToMigrate.history.initialState);
            else stateMigration(propertiesToMigrate.currentState);
        }
        if (!propertiesToMigrate.history) continue;
        const actionMigration = migrations[i]!.actions;
        if (actionMigration !== null) {
            actionMigration(
                propertiesToMigrate.history.initialState,
                propertiesToMigrate.history.actions
            );
        }
    }
    if (propertiesToMigrate.history)
        propertiesToMigrate.currentState = applyAllActions(
            propertiesToMigrate.history.initialState as ExerciseState,
            propertiesToMigrate.history.actions.filter(
                (action) => action !== null
            ) as ExerciseAction[]
        );
    return targetVersion;
}
