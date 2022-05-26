import { createNewDataSource } from '../data-source';
import { DatabaseService } from '../services/database-service';

const dataSource = await createNewDataSource().initialize();

const databaseService = new DatabaseService(dataSource);

await databaseService.transaction(async (manager) => {
    const exercises = await databaseService.exerciseWrapperService.findAll(
        { select: { id: true } },
        manager
    );

    const deleteResult = await Promise.all(
        exercises.map(async (exercise) =>
            databaseService.exerciseWrapperService.remove(exercise.id, manager)
        )
    );

    console.log(
        `Successfully deleted ${deleteResult.reduce(
            (currentAffectedCount, currentDeleteResult) =>
                currentAffectedCount + (currentDeleteResult.affected ?? 0),
            0
        )} of ${exercises.length} exercises.`
    );
});
