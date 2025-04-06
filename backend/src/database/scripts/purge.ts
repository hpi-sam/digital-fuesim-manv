import { createNewDataSource } from '../data-source.js';
import { DatabaseService } from '../services/database-service.js';

const dataSource = await createNewDataSource().initialize();

const databaseService = new DatabaseService(dataSource);

await databaseService.transaction(async (manager) => {
    const exercises = await databaseService.exerciseWrapperService.getFindAll({
        select: { id: true },
    })(manager);

    const deleteResult = await Promise.all(
        exercises.map(async (exercise) =>
            databaseService.exerciseWrapperService.getRemove(exercise.id)(
                manager
            )
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
