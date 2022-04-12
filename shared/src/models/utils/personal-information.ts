import { IsNumber, IsString } from 'class-validator';
import { getCreate } from './get-create';

export class PersonalInformation {
    @IsString()
    public readonly name: string;
    @IsString()
    public readonly biometry: string;
    @IsString()
    public readonly address: string;
    /**
     * Without year
     * @example
     * `24.02.`
     */
    @IsString()
    public readonly birthdate: string;

    @IsNumber()
    public readonly age: number;

    /**
     * @example
     * 'männlich' | 'weiblich' | 'unbestimmt'
     */
    @IsString()
    public readonly sex: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        name: string,
        biometry: string,
        address: string,
        birthdate: string,
        age: number,
        sex: string
    ) {
        this.name = name;
        this.biometry = biometry;
        this.address = address;
        this.birthdate = birthdate;
        this.age = age;
        this.sex = sex;
    }

    static readonly create = getCreate(this);
}
