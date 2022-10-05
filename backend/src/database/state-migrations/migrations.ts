import type {
    ExerciseAction,
    Mutable,
    StateExport,
    UUID,
} from 'digital-fuesim-manv-shared';
import { applyAllActions, ExerciseState } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { RestoreError } from '../../utils/restore-error';
import { ActionWrapperEntity } from '../entities/action-wrapper.entity';
import { ExerciseWrapperEntity } from '../entities/exercise-wrapper.entity';
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
 * Such a function gets the not yet migrated state and is expected to return a migrated version of it.
 * It may throw a {@link RestoreError} when a migration is not possible.
 */
type MigrateStateFunction = (state: object) => object;

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
    const {
        currentStateVersion: newStateVersion,
        currentState: newCurrentState,
        history,
    } = applyMigrations(exercise.stateVersion, currentState, {
        initialState,
        actions,
    });
    // Save exercise
    const patch: Partial<ExerciseWrapperEntity> = {
        stateVersion: newStateVersion,
    };
    patch.initialStateString = JSON.stringify(history!.initialState);
    patch.currentStateString = JSON.stringify(newCurrentState);
    await entityManager.update(
        ExerciseWrapperEntity,
        { id: exerciseId },
        patch
    );
    // Save actions
    if (history!.actions !== undefined) {
        let patchedActionsIndex = 0;
        const indicesToRemove: number[] = [];
        const actionsToUpdate: {
            previousIndex: number;
            newIndex: number;
            actionString: string;
        }[] = [];
        history!.actions.forEach((action, i) => {
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

export function migrateStateExport(stateExport: StateExport): StateExport {
    const { currentState, history } = applyMigrations(
        stateExport.dataVersion,
        stateExport.currentState,
        stateExport.history
            ? {
                  initialState: stateExport.history.initialState,
                  actions: stateExport.history.actionHistory,
              }
            : undefined
    );
    if (stateExport.history) {
        stateExport.history.initialState = history!
            .initialState as Mutable<ExerciseState>;
        stateExport.history.actionHistory = history!.actions.filter(
            (action) => action !== null
        ) as ExerciseAction[];
    }
    stateExport.currentState = currentState as Mutable<ExerciseState>;
    return stateExport;
}

function applyMigrations(
    currentStateVersion: number,
    currentState: object,
    history?: { initialState: object; actions: (object | null)[] }
): {
    currentStateVersion: number;
    currentState: ExerciseState;
    history?: {
        initialState: ExerciseState;
        actions: (ExerciseAction | null)[];
    };
} {
    const targetVersion = ExerciseState.currentStateVersion;
    let newCurrentState = currentState;
    for (let i = currentStateVersion + 1; i <= targetVersion; i++) {
        const stateMigration = migrations[i]!.state;
        if (stateMigration !== null) {
            if (history)
                history.initialState = stateMigration(history.initialState);
            else newCurrentState = stateMigration(newCurrentState);
        }
        if (!history) continue;
        const actionMigration = migrations[i]!.actions;
        if (actionMigration !== null) {
            actionMigration(history.initialState, history.actions);
        }
    }
    if (history)
        newCurrentState = applyAllActions(
            history.initialState as ExerciseState,
            history.actions.filter(
                (action) => action !== null
            ) as ExerciseAction[]
        );
    return {
        currentStateVersion: targetVersion,
        currentState: newCurrentState as ExerciseState,
        history: history
            ? {
                  initialState: history?.initialState as ExerciseState,
                  actions: history?.actions as (ExerciseAction | null)[],
              }
            : undefined,
    };
}
