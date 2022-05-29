import { IsBoolean } from 'class-validator';
import { getCreate } from '../models/utils';

export class ExerciseConfiguration {
    @IsBoolean()
    public readonly pretriageEnabled: boolean = true;
    @IsBoolean()
    public readonly bluePatientsEnabled: boolean = false;

    static readonly create = getCreate(this);
}
