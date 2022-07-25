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
import { Mutable } from '../../utils';
import { BaseExportImportFile } from './base-file';

export class StateHistoryCompound {
    @IsArray()
    public actionHistory: ExerciseAction[];

    @ValidateNested()
    @Type(() => ExerciseState)
    public initialState: Mutable<ExerciseState>;

    public validateActions(): (ValidationError | string)[][] {
        return this.actionHistory.map((action) =>
            validateExerciseAction(action)
        );
    }

    public constructor(
        actionHistory: ExerciseAction[],
        initialState: Mutable<ExerciseState>
    ) {
        this.actionHistory = actionHistory;
        this.initialState = initialState;
    }
}

export class StateExport extends BaseExportImportFile {
    @IsIn(['complete'])
    @IsString()
    public readonly type: 'complete' = 'complete';

    @ValidateNested()
    @Type(() => ExerciseState)
    public currentState: Mutable<ExerciseState>;

    @IsOptional()
    @ValidateNested()
    @Type(() => StateHistoryCompound)
    public readonly history?: StateHistoryCompound;

    public constructor(
        currentState: Mutable<ExerciseState>,
        stateHistory?: StateHistoryCompound
    ) {
        super();
        this.currentState = currentState;
        this.history = stateHistory;
    }
}
