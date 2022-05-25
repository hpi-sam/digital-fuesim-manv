import type { DataSource, EntityManager } from 'typeorm';
import { ActionEmitterService } from './action-emitter.service';
import { ActionWrapperService } from './action-wrapper.service';
import { ExerciseWrapperService } from './exercise-wrapper.service';

export class DatabaseService {
    public readonly actionEmitterService: ActionEmitterService;
    public readonly actionWrapperService: ActionWrapperService;
    public readonly exerciseWrapperService: ExerciseWrapperService;

    public constructor(public readonly dataSource: DataSource) {
        this.exerciseWrapperService = new ExerciseWrapperService(dataSource);
        this.actionEmitterService = new ActionEmitterService(
            this.exerciseWrapperService,
            dataSource
        );
        this.actionWrapperService = new ActionWrapperService(
            this.actionEmitterService,
            dataSource
        );
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
