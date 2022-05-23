import { IsString } from 'class-validator';

type StartPointType = 'AlarmGroup' | 'TransferPoint';

export class StartPoint {
    @IsString()
    public readonly type: StartPointType;

    @IsString()
    public readonly name: string;

    constructor(type: StartPointType, name: string) {
        this.type = type;
        this.name = name;
    }
}
