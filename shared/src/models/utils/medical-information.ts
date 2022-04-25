import { IsString } from 'class-validator';
import { getCreate } from './get-create';

export class MedicalInformation {
    @IsString()
    public readonly breathing: string;

    @IsString()
    public readonly consciousness: string;

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

    @IsString()
    public readonly injuries: string;

    @IsString()
    public readonly bodyCheck: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        breathing: string,
        consciousness: string,
        pulse: string,
        skin: string,
        pain: string,
        pupils: string,
        psyche: string,
        hearing: string,
        injuries: string,
        bodyCheck: string
    ) {
        this.breathing = breathing;
        this.consciousness = consciousness;
        this.pulse = pulse;
        this.skin = skin;
        this.pain = pain;
        this.pupils = pupils;
        this.psyche = psyche;
        this.hearing = hearing;
        this.injuries = injuries;
        this.bodyCheck = bodyCheck;
    }

    static readonly create = getCreate(this);
}
