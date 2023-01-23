import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { getCreate } from './get-create';

export class Breathing {
    @IsString()
    public readonly pattern: string;

    @IsString()
    public readonly frequency: string;

    @IsString()
    public readonly zyanose: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(pattern: string, frequency: string, zyanose: string) {
        this.pattern = pattern;
        this.frequency = frequency;
        this.zyanose = zyanose;
    }

    static create = getCreate(this);
}

export class Circulation {
    @IsString()
    public readonly pulse: string;

    @IsString()
    public readonly rhythm: string;

    @IsString()
    public readonly location: string;

    @IsString()
    public readonly recap: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        pulse: string,
        rhythm: string,
        location: string,
        recap: string
    ) {
        this.pulse = pulse;
        this.rhythm = rhythm;
        this.location = location;
        this.recap = recap;
    }

    static create = getCreate(this);
}

export class Disability {
    @IsString()
    public readonly pupils: string;

    @IsString()
    public readonly gcs: string;

    @IsString()
    public readonly eyes: string;

    @IsString()
    public readonly speaking: string;

    @IsString()
    public readonly motoric: string;

    @IsString()
    public readonly psyche: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        pupils: string,
        gcs: string,
        eyes: string,
        speaking: string,
        motoric: string,
        psyche: string
    ) {
        this.pupils = pupils;
        this.gcs = gcs;
        this.eyes = eyes;
        this.speaking = speaking;
        this.motoric = motoric;
        this.psyche = psyche;
    }

    static create = getCreate(this);
}

export class Exposure {
    @IsString()
    public readonly pain: string;

    @IsString()
    public readonly skin: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(pain: string, skin: string) {
        this.pain = pain;
        this.skin = skin;
    }

    static create = getCreate(this);
}

export class PretriageInformation {
    @IsString()
    public readonly injuries: string;

    @IsString()
    public readonly bodyCheck: string;

    @IsBoolean()
    public readonly isWalkable: boolean;

    @IsString()
    public readonly xCriticalBleeding: string;

    @IsString()
    public readonly aAirway: string;

    @ValidateNested()
    @Type(() => Breathing)
    public readonly bBreathing: Breathing;

    @ValidateNested()
    @Type(() => Circulation)
    public readonly cCirculation: Circulation;

    @ValidateNested()
    @Type(() => Disability)
    public readonly dDisability: Disability;

    @ValidateNested()
    @Type(() => Exposure)
    public readonly eExposure: Exposure;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        injuries: string,
        bodyCheck: string,
        isWalkable: boolean,
        xCriticalBleeding: string,
        aAirway: string,
        bBreathing: Breathing,
        cCirculation: Circulation,
        dDisability: Disability,
        eExposure: Exposure
    ) {
        this.injuries = injuries;
        this.bodyCheck = bodyCheck;
        this.isWalkable = isWalkable;
        this.xCriticalBleeding = xCriticalBleeding;
        this.aAirway = aAirway;
        this.bBreathing = bBreathing;
        this.cCirculation = cCirculation;
        this.dDisability = dDisability;
        this.eExposure = eExposure;
    }

    static create = getCreate(this);
}
