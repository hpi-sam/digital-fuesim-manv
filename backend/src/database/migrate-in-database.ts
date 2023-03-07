import type { UUID } from 'digital-fuesim-manv-shared';
import { applyMigrations } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { RestoreError } from '../utils/restore-error';
import { ActionWrapperEntity } from './entities/action-wrapper.entity';
import { ExerciseWrapperEntity } from './entities/exercise-wrapper.entity';

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
    const loadedInitialState = JSON.parse(exercise.initialStateString);
    const loadedCurrentState = JSON.parse(exercise.currentStateString);
    const loadedActions = (
        await entityManager.find(ActionWrapperEntity, {
            where: { exercise: { id: exerciseId } },
            select: { actionString: true },
            order: { index: 'ASC' },
        })
    ).map((action) => JSON.parse(action.actionString));
    const {
        newVersion,
        migratedProperties: {
            currentState,
            history: { initialState, actions },
        },
    } = applyMigrations(exercise.stateVersion, {
        currentState: loadedCurrentState,
        history: {
            initialState: loadedInitialState,
            actions: loadedActions,
        },
    });
    exercise.stateVersion = newVersion;
    // Save exercise wrapper
    const patch: Partial<ExerciseWrapperEntity> = {
        stateVersion: exercise.stateVersion,
        initialStateString: JSON.stringify(initialState),
        currentStateString: JSON.stringify(currentState),
    };
    await entityManager.update(
        ExerciseWrapperEntity,
        { id: exerciseId },
        patch
    );
    // Save actions
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
