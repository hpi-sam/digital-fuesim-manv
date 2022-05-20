import { createNewDataSource } from '../data-source';
import { ServiceProvider } from '../services/service-provider';

const dataSource = await createNewDataSource().initialize();

const services = new ServiceProvider(dataSource);

await services.transaction(async (manager) => {
    const exercises = await services.exerciseWrapperService.findAll(
        { select: { id: true } },
        manager
    );

    const deleteResult = await Promise.all(
        exercises.map(async (exercise) =>
            services.exerciseWrapperService.remove(exercise.id, manager)
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
