import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class ReportIntervalConfiguration {
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    interval?: number;
}
