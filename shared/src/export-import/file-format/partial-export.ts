import { Type } from 'class-transformer';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { VehicleTemplate, MapImageTemplate } from '../../models';
import { PatientCategory } from '../../models/patient-category';
import { IsValue } from '../../utils/validators';
import { BaseExportImportFile } from './base-file';

export class PartialExport extends BaseExportImportFile {
    @IsValue('partial' as const)
    public readonly type: 'partial' = 'partial';

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PatientCategory)
    public readonly patientCategories?: PatientCategory[];

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

    public constructor(
        patientCategories?: PatientCategory[],
        vehicleTemplates?: VehicleTemplate[],
        mapImageTemplates?: MapImageTemplate[]
    ) {
        super();
        this.patientCategories = patientCategories;
        this.vehicleTemplates = vehicleTemplates;
        this.mapImageTemplates = mapImageTemplates;
    }
}
