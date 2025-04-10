import { ExerciseState } from '../state.js';
import type { ExerciseAction } from '../store/index.js';
import { ReducerError, applyAction } from '../store/index.js';
import type { Mutable, UUID } from '../utils/index.js';
import { cloneDeepMutable } from '../utils/index.js';
import {
    PartialExport,
    StateExport,
} from '../export-import/file-format/index.js';
import type { MapImageTemplate, VehicleTemplate } from '../models/index.js';
import type { PatientCategory } from '../models/patient-category.js';
import type { Migration } from './migration-functions.js';
import { migrations } from './migration-functions.js';

export function migrateStateExport(
    stateExportToMigrate: StateExport
): Mutable<StateExport> {
    const stateExport = cloneDeepMutable(stateExportToMigrate);
    const {
        newVersion,
        migratedProperties: { currentState, history },
    } = applyMigrations(stateExport.dataVersion, {
        currentState: stateExport.currentState,
        history: stateExport.history
            ? {
                  initialState: stateExport.history.initialState,
                  actions: stateExport.history.actionHistory,
              }
            : undefined,
    });

    stateExport.dataVersion = newVersion;
    stateExport.currentState = currentState;
    if (stateExport.history) {
        if (history) {
            stateExport.history = {
                actionHistory: history.actions.filter(
                    // Remove actions that are marked to be removed by the migrations
                    (action): action is Mutable<ExerciseAction> =>
                        action !== null
                ),
                initialState: history.initialState,
            };
        } else {
            stateExport.history = undefined;
        }
    }
    return stateExport;
}
export function migratePartialExport(
    partialExportToMigrate: PartialExport
): Mutable<PartialExport> {
    // Encapsulate the partial export in a state export and migrate it
    const mutablePartialExport = cloneDeepMutable(partialExportToMigrate);
    const stateExport = cloneDeepMutable(
        new StateExport({
            ...cloneDeepMutable(ExerciseState.create('123456')),
            mapImageTemplates: mutablePartialExport.mapImageTemplates ?? [],
            patientCategories: mutablePartialExport.patientCategories ?? [],
            vehicleTemplates: mutablePartialExport.vehicleTemplates ?? [],
        })
    );
    stateExport.fileVersion = mutablePartialExport.fileVersion;
    stateExport.dataVersion = mutablePartialExport.dataVersion;
    const migratedStateExport = migrateStateExport(stateExport as StateExport);
    const mapImageTemplates =
        mutablePartialExport.mapImageTemplates !== undefined
            ? (migratedStateExport.currentState
                  .mapImageTemplates as MapImageTemplate[])
            : undefined;
    const patientCategories =
        mutablePartialExport.patientCategories !== undefined
            ? (migratedStateExport.currentState
                  .patientCategories as PatientCategory[])
            : undefined;
    const vehicleTemplates =
        mutablePartialExport.vehicleTemplates !== undefined
            ? (migratedStateExport.currentState
                  .vehicleTemplates as VehicleTemplate[])
            : undefined;
    const migratedPartialExport = new PartialExport(
        patientCategories,
        vehicleTemplates,
        mapImageTemplates
    );
    return cloneDeepMutable(migratedPartialExport);
}

/**
 * Migrates {@link propertiesToMigrate} to the newest version ({@link ExerciseState.currentStateVersion})
 * Might mutate the input.
 * @returns The new state version
 */
export function applyMigrations<
    H extends { initialState: object; actions: (object | null)[] } | undefined,
>(
    currentStateVersion: number,
    propertiesToMigrate: {
        currentState: object;
        history: H;
    }
): {
    newVersion: number;
    migratedProperties: {
        currentState: Mutable<ExerciseState>;
        history: H extends undefined
            ? undefined
            :
                  | {
                        initialState: Mutable<ExerciseState>;
                        actions: (Mutable<ExerciseAction> | null)[];
                    }
                  | undefined;
    };
} {
    const newVersion = ExerciseState.currentStateVersion;

    const migrationsToApply: Migration[] = [];
    for (let i = currentStateVersion + 1; i <= newVersion; i++) {
        migrationsToApply.push(migrations[i]!);
    }

    const history = propertiesToMigrate.history;
    if (history) {
        migrateState(migrationsToApply, history.initialState);
        const intermediaryState = cloneDeepMutable(
            history.initialState
        ) as Mutable<ExerciseState>;
        try {
            history.actions.forEach((action, index) => {
                if (action !== null) {
                    const deleteAction = !migrateAction(
                        migrationsToApply,
                        intermediaryState,
                        action
                    );
                    if (!deleteAction) {
                        try {
                            applyAction(
                                intermediaryState,
                                action as ExerciseAction
                            );
                        } catch (e: unknown) {
                            if (e instanceof ReducerError) {
                                const json = JSON.stringify(action);
                                console.warn(
                                    `Error while applying action ${json}: ${e.message}`
                                );
                            }
                            throw e;
                        }
                    } else {
                        history.actions[index] = null;
                    }
                }
            });
            return {
                newVersion,
                migratedProperties: {
                    currentState: intermediaryState,
                    // history has been migrated in place
                    history: history as any,
                },
            };
        } catch (e: unknown) {
            if (e instanceof ReducerError) {
                // Fall back to migrating currentState instead of recreating it from history
                const exerciseId = (history.initialState as { id: UUID }).id;
                console.warn(
                    `Discarding history of exercise ${exerciseId} due to error in applying actions: ${e.message}`,
                    e.stack
                );
            } else {
                throw e;
            }
        }
    }
    migrateState(migrationsToApply, propertiesToMigrate.currentState);
    const currentState =
        propertiesToMigrate.currentState as Mutable<ExerciseState>;
    return {
        newVersion,
        migratedProperties: {
            currentState,
            history: undefined as any,
        },
    };
}

function migrateState(migrationsToApply: Migration[], currentState: object) {
    migrationsToApply.forEach((migration) => {
        if (migration.state) migration.state(currentState);
    });
}

/**
 * @returns true if all went well and false if the action should be deleted
 */
function migrateAction(
    migrationsToApply: Migration[],
    intermediaryState: object,
    action: object
): boolean {
    return migrationsToApply.every((migration) => {
        if (migration.action) {
            return migration.action(intermediaryState, action);
        }
        return true;
    });
}
