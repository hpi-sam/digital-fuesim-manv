import { getCreate } from '../models/utils';

export class ExerciseConfiguration {
    public readonly pretriageEnabled: boolean = true;
    public readonly bluePatientsEnabled: boolean = false;

    static readonly create = getCreate(this);
}
