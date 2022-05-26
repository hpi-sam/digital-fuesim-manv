import type { DataSource, EntityManager } from 'typeorm';
import { DatabaseError } from '../database-error';
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

    private transactionActive = false;

    /**
     * Wrap all operations into one database transaction. Note that all calls inside MUST use the provided manager.
     */
    public async transaction<T>(
        operation: (manager: EntityManager) => Promise<T>
    ) {
        if (this.transactionActive) {
            throw new DatabaseError(
                'A transaction is already running; nested transactions are not supported.'
            );
        }
        this.transactionActive = true;
        const transactionResult = await this.dataSource.transaction(operation);
        this.transactionActive = false;
        return transactionResult;
    }
}
