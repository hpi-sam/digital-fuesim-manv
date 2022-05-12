import { Type } from 'class-transformer';
import { IsInt, IsObject, IsUUID, Min, ValidateNested } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { getCreate } from './utils';
import { AreaStatistics } from './utils/area-statistics';

export class StatisticsEntry {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    /**
     * The exercise time in ms where these statistics were created.
     */
    @IsInt()
    @Min(0)
    public readonly exerciseTime: number;

    @IsObject()
    readonly viewports: {
        readonly [viewportId: string]: AreaStatistics;
    };

    @ValidateNested()
    @Type(() => AreaStatistics)
    readonly exercise: AreaStatistics;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        viewports: {
            readonly [viewportId: string]: AreaStatistics;
        },
        exercise: AreaStatistics,
        exerciseTime: number
    ) {
        this.viewports = viewports;
        this.exercise = exercise;
        this.exerciseTime = exerciseTime;
    }

    static readonly create = getCreate(this);
}
