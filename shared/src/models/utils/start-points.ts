import type { TypeOptions } from 'class-transformer';
import { IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { getCreate } from './get-create';

export type StartPoint = AlarmGroupStartPoint | TransferStartPoint;

export class TransferStartPoint {
    @IsValue('transferStartPoint' as const)
    public readonly type = 'transferStartPoint';

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
    @IsValue('alarmGroupStartPoint' as const)
    public readonly type = 'alarmGroupStartPoint';

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

export const startPointTypeOptions: TypeOptions = {
    keepDiscriminatorProperty: true,
    discriminator: {
        property: 'type',
        subTypes: [
            {
                name: 'alarmGroupStartPoint',
                value: AlarmGroupStartPoint,
            },
            {
                name: 'transferStartPoint',
                value: TransferStartPoint,
            },
        ],
    },
};
