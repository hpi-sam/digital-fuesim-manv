import { IsIn, IsInt, IsString, Min } from 'class-validator';
import { ExerciseState } from '../../state';

export abstract class BaseExportImportFile {
    public static readonly currentFileVersion = 1;

    @IsInt()
    @Min(0)
    public readonly fileVersion: number =
        BaseExportImportFile.currentFileVersion;

    @IsInt()
    @Min(0)
    public readonly dataVersion: number = ExerciseState.currentStateVersion;

    @IsIn(['complete', 'partial'])
    @IsString()
    public abstract readonly type: 'complete' | 'partial';
}
