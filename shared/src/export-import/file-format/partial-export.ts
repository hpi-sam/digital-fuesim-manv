import { Type } from 'class-transformer';
import {
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import {
    MapImageTemplate,
    PatientTemplate,
    TileMapProperties,
    VehicleTemplate,
    Viewport,
} from '../../models';
import { ExportImportFile } from './base-file';

export class PartialExport extends ExportImportFile {
    @IsIn(['partial'])
    @IsString()
    public readonly type: 'partial' = 'partial';

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Viewport)
    public readonly viewports?: Viewport[];

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

    @IsOptional()
    @ValidateNested()
    @Type(() => TileMapProperties)
    public readonly tileMapProperties?: TileMapProperties;
}
