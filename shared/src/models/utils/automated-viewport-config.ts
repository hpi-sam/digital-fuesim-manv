import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from './get-create';

export type TransferMode = 'hospital' | 'none' | 'transfer';

export const transferModeNames: { [mode in TransferMode]: string } = {
    hospital: 'Krankenhaus',
    none: 'Kein Transport',
    transfer: 'Innerhalb der Lage',
};
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
    public readonly transferMode: TransferMode;
    @IsBoolean()
    public readonly isAutomated: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        transferMode: TransferMode,
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
