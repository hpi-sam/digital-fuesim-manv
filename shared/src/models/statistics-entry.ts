import { Type } from 'class-transformer';
import { IsObject, IsUUID, ValidateNested } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { getCreate } from './utils';
import { AreaStatistics } from './utils/area-statistics';

export class StatisticsEntry {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

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
        exercise: AreaStatistics
    ) {
        this.viewports = viewports;
        this.exercise = exercise;
    }

    static readonly create = getCreate(this);
}
