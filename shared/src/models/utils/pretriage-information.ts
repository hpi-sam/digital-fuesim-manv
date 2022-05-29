import { IsString } from 'class-validator';

export class PretriageInformation {
    @IsString()
    public readonly injuries: string;

    @IsString()
    public readonly bodyCheck: string;

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

    constructor(
        injuries: string,
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
}
