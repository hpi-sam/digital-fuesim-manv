import { getCreate } from "../models/utils";

export class ExerciseConfiguration{
    public readonly pretriageEnabled: boolean = true;

    static readonly create = getCreate(this);
}
