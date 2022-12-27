import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ExerciseState } from '../../state';
import type { ExerciseAction } from '../../store';
import { IsExerciseAction } from '../../store';
import { Mutable } from '../../utils';
import { IsValue } from '../../utils/validators';
import { BaseExportImportFile } from './base-file';

export class StateHistoryCompound {
    @IsArray()
    @IsExerciseAction({ each: true })
    public actionHistory: ExerciseAction[];

    @ValidateNested()
    @Type(() => ExerciseState)
    public initialState: Mutable<ExerciseState>;

    public constructor(
        actionHistory: ExerciseAction[],
        initialState: Mutable<ExerciseState>
    ) {
        this.actionHistory = actionHistory;
        this.initialState = initialState;
    }
}

export class StateExport extends BaseExportImportFile {
    @IsValue('complete' as const)
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
