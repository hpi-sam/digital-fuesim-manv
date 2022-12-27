import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import {
    MapImageTemplate,
    PatientTemplate,
    VehicleTemplate,
} from '../../models';
import { IsValue } from '../../utils/validators';
import { BaseExportImportFile } from './base-file';

export class PartialExport extends BaseExportImportFile {
    @IsValue('partial' as const)
    public readonly type: 'partial' = 'partial';

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PatientTemplate)
    public readonly patientTemplates?: PatientTemplate[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VehicleTemplate)
    public readonly vehicleTemplates?: VehicleTemplate[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MapImageTemplate)
    public readonly mapImageTemplates?: MapImageTemplate[];
}
