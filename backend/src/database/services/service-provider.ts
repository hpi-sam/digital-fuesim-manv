import type { DataSource } from 'typeorm';
import { ActionEmitterService } from './action-emitter.service';
import { ActionWrapperService } from './action-wrapper.service';
import { ExerciseWrapperService } from './exercise-wrapper.service';

export class ServiceProvider {
    public readonly actionEmitterService: ActionEmitterService;
    public readonly actionWrapperService: ActionWrapperService;
    public readonly exerciseWrapperService: ExerciseWrapperService;

    public constructor(dataSource: DataSource) {
        this.actionEmitterService = new ActionEmitterService(dataSource);
        this.exerciseWrapperService = new ExerciseWrapperService(dataSource);
        this.actionWrapperService = new ActionWrapperService(
            this.actionEmitterService,
            this.exerciseWrapperService,
            dataSource
        );
    }
}
