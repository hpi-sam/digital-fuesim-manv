import { IsInt, Min } from 'class-validator';
import { ExerciseState } from '../../state';
import { IsStringLiteralUnion } from '../../utils/validators';

export abstract class BaseExportImportFile {
    public static readonly currentFileVersion = 1;

    @IsInt()
    @Min(0)
    public readonly fileVersion: number =
        BaseExportImportFile.currentFileVersion;

    @IsInt()
    @Min(0)
    public readonly dataVersion: number = ExerciseState.currentStateVersion;

    @IsStringLiteralUnion<'complete' | 'partial'>({
        complete: true,
        partial: true,
    })
    public abstract readonly type: 'complete' | 'partial';
}
