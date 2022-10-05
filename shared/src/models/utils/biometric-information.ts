import { IsInt, IsString, Min } from 'class-validator';
import { IsStringLiteralUnion } from '../../utils/validators';
import { getCreate } from './get-create';
import { Sex } from './sex';

export class BiometricInformation {
    @IsInt()
    @Min(0)
    public readonly age: number;

    @IsStringLiteralUnion<Sex>({ diverse: true, female: true, male: true })
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
