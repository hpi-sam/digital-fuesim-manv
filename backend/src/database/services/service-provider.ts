import type { DataSource } from 'typeorm';
import { ActionEmitterService } from './action-emitter.service';
import { ActionWrapperService } from './action-wrapper.service';
import { ExerciseWrapperService } from './exercise-wrapper.service';

export class ServiceProvider {
    public readonly actionEmitterService: ActionEmitterService;
    public readonly actionWrapperService: ActionWrapperService;
    public readonly exerciseWrapperService: ExerciseWrapperService;

    public constructor(dataSource: DataSource) {
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
}
