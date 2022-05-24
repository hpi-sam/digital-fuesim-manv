import { IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from './get-create';

export class TransferStartPoint {
    @IsUUID(4, uuidValidationOptions)
    transferStartPointId: UUID;

    @IsString()
    type = 'TransferStartPoint';
    /**
     * @deprecated Use {@link create} instead
     */
    constructor(transferStartPointId: UUID) {
        this.transferStartPointId = transferStartPointId;
    }

    static readonly create = getCreate(this);
}

export class AlarmGroupStartPoint {
    @IsString()
    alarmGroupName: string;

    @IsNumber()
    @Min(0)
    duration: number;

    @IsString()
    type = 'AlarmGroupStartPoint';

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(alarmGroupName: string, duration: number) {
        this.alarmGroupName = alarmGroupName;
        this.duration = duration;
    }

    static readonly create = getCreate(this);
}
