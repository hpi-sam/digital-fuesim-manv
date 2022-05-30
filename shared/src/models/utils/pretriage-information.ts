import { IsBoolean, IsString } from 'class-validator';
import { getCreate } from './get-create';

export class PretriageInformation {
    @IsString()
    public readonly injuries: string;

    @IsString()
    public readonly bodyCheck: string;

    @IsBoolean()
    public readonly isWalkable: boolean;

    @IsString()
    public readonly breathing: string;

    @IsString()
    public readonly awareness: string;

    @IsString()
    public readonly pulse: string;

    @IsString()
    public readonly skin: string;

    @IsString()
    public readonly pain: string;

    @IsString()
    public readonly pupils: string;

    @IsString()
    public readonly psyche: string;

    @IsString()
    public readonly hearing: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        injuries: string,
        isWalkable: boolean,
        bodyCheck: string,
        breathing: string,
        awareness: string,
        pulse: string,
        skin: string,
        pain: string,
        pupils: string,
        psyche: string,
        hearing: string
    ) {
        this.injuries = injuries;
        this.isWalkable = isWalkable;
        this.bodyCheck = bodyCheck;
        this.breathing = breathing;
        this.awareness = awareness;
        this.pulse = pulse;
        this.skin = skin;
        this.pain = pain;
        this.pupils = pupils;
        this.psyche = psyche;
        this.hearing = hearing;
    }

    static create = getCreate(this);
}
