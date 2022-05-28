import { IsIn, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from './get-create';

export type StartPoint = AlarmGroupStartPoint | TransferStartPoint;

export class TransferStartPoint {
    @IsIn(['transferPoint'])
    public readonly type = 'transferPoint';

    @IsUUID(4, uuidValidationOptions)
    public readonly transferPointId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(transferPointId: UUID) {
        this.transferPointId = transferPointId;
    }

    static readonly create = getCreate(this);
}

export class AlarmGroupStartPoint {
    @IsIn(['alarmGroup'])
    public readonly type = 'alarmGroup';

    @IsString()
    public readonly alarmGroupName: string;

    @IsNumber()
    @Min(0)
    public readonly duration: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(alarmGroupName: string, duration: number) {
        this.alarmGroupName = alarmGroupName;
        this.duration = duration;
    }

    static readonly create = getCreate(this);
}
