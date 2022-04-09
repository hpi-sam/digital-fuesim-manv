import { IsNumber, IsString } from 'class-validator';

export class PersonalInformation {
    @IsString()
    name: string;
    @IsString()
    biometry: string;
    @IsString()
    address: string;
    /**
     * Without year
     * @example
     * `24.02.`
     */
    @IsString()
    birthdate: string;

    @IsNumber()
    age: number;

    /**
     * @example
     * 'männlich' | 'weiblich' | 'unbestimmt'
     */
    @IsString()
    sex: string;

    private constructor(
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

    static create(
        name: string,
        biometry: string,
        address: string,
        birthdate: string,
        age: number,
        sex: string
    ) {
        return {
            ...new PersonalInformation(
                name,
                biometry,
                address,
                birthdate,
                age,
                sex
            ),
        };
    }
}
