import { Allow, IsNumber, IsString } from 'class-validator';

export class PersonalInformation {
    @IsString()
    name: string;
    @IsString()
    biometry: string;
    @IsString()
    adress: string;
    /**
     * Without year
     */
    @IsString()
    birthdate: string;

    @IsNumber()
    age: number;

    @Allow()
    sex: 'female' | 'male';

    constructor(
        name: string,
        biometry: string,
        adress: string,
        birthdate: string,
        age: number,
        sex: 'female' | 'male'
    ) {
        this.name = name;
        this.biometry = biometry;
        this.adress = adress;
        this.birthdate = birthdate;
        this.age = age;
        this.sex = sex;
    }
}
