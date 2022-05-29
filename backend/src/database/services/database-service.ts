import type { DataSource, EntityManager } from 'typeorm';
import { ActionWrapperService } from './action-wrapper.service';
import { ExerciseWrapperService } from './exercise-wrapper.service';

export class DatabaseService {
    public readonly actionWrapperService: ActionWrapperService;
    public readonly exerciseWrapperService: ExerciseWrapperService;

    public constructor(private readonly dataSource: DataSource) {
        this.exerciseWrapperService = new ExerciseWrapperService(dataSource);
        this.actionWrapperService = new ActionWrapperService(
            this.exerciseWrapperService,
            dataSource
        );
    }

    public get isInitialized() {
        return this.dataSource.isInitialized;
    }

    /**
     * Wrap all operations into one database transaction. Note that all calls inside MUST use the provided manager.
     */
    public async transaction<T>(
        operation: (manager: EntityManager) => Promise<T>
    ) {
        return this.dataSource.transaction(operation);
    }
}
