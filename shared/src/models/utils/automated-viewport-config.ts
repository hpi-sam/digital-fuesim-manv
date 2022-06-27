import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from './get-create';

export class AutomatedViewportConfig {
    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    public readonly sourceTransferPointId?: UUID;
    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId?: UUID;
    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    public readonly targetHospitalId?: UUID;
    @IsString()
    public readonly transferMode: 'hospital' | 'none' | 'transfer';
    @IsBoolean()
    public readonly isAutomated: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        transferMode: 'hospital' | 'none' | 'transfer',
        isAutomated: boolean,
        sourceTransferPointId?: UUID,
        targetTransferPointId?: UUID,
        targetHospitalId?: UUID
    ) {
        this.sourceTransferPointId = sourceTransferPointId;
        this.targetTransferPointId = targetTransferPointId;
        this.targetHospitalId = targetHospitalId;
        this.transferMode = transferMode;
        this.isAutomated = isAutomated;
    }

    static readonly create = getCreate(this);
}
