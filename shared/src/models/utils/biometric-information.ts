import { IsInt, IsString, Min } from 'class-validator';
import { IsLiteralUnion } from '../../utils/validators/index.js';
import { getCreate } from './get-create.js';
import type { Sex } from './sex.js';
import { sexAllowedValues } from './sex.js';

export class BiometricInformation {
    @IsInt()
    @Min(0)
    public readonly age: number;

    @IsLiteralUnion(sexAllowedValues)
    public readonly sex: Sex;

    /**
     * @example
     * 'blass blau-graue Augen, sehr helle Haut, 174cm'
     */
    @IsString()
    public readonly externalFeatures: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(externalFeatures: string, age: number, sex: Sex) {
        this.externalFeatures = externalFeatures;
        this.age = age;
        this.sex = sex;
    }

    static readonly create = getCreate(this);
}
