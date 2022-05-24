import { Type } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import {
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { ExerciseState } from '../../state';
import type { ExerciseAction } from '../../store';
import { validateExerciseAction } from '../../store';
import { ExportImportFile } from './base-file';

export class StateHistoryCompound {
    @IsArray()
    public readonly actionHistory: ExerciseAction[];

    @ValidateNested()
    @Type(() => ExerciseState)
    public readonly initialState: ExerciseState;

    public validateActions(): (ValidationError | string)[][] {
        return this.actionHistory.map((action) =>
            validateExerciseAction(action)
        );
    }

    public constructor(
        actionHistory: ExerciseAction[],
        initialState: ExerciseState
    ) {
        this.actionHistory = actionHistory;
        this.initialState = initialState;
    }
}

export class StateExport extends ExportImportFile {
    @IsIn(['complete'])
    @IsString()
    public readonly type: 'complete' = 'complete';

    @ValidateNested()
    @Type(() => ExerciseState)
    public readonly currentState: ExerciseState;

    @IsOptional()
    @ValidateNested()
    @Type(() => StateHistoryCompound)
    public readonly history?: StateHistoryCompound;

    public constructor(
        currentState: ExerciseState,
        stateHistory?: StateHistoryCompound
    ) {
        super();
        this.currentState = currentState;
        this.history = stateHistory;
    }
}
