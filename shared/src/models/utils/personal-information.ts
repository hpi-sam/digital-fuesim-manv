import { IsString } from 'class-validator';
import {
    femaleFirstNames,
    maleFirstNames,
} from '../../data/generator-data/first-names';
import { surnames } from '../../data/generator-data/surnames';
import { getCreate } from './get-create';

export class PersonalInformation {
    @IsString()
    public readonly name: string;
    @IsString()
    public readonly address: string;
    /**
     * Without year
     * @example
     * `24.02.`
     */
    @IsString()
    public readonly birthdate: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(name: string, address: string, birthdate: string) {
        this.name = name;
        this.address = address;
        this.birthdate = birthdate;
    }

    static readonly create = getCreate(this);

    static generatePersonalInformation(isMale: boolean): PersonalInformation {
        const address = `Musterstraße ${Math.floor(Math.random() * 1000)}`;
        return PersonalInformation.create(
            generateName(isMale),
            address,
            generateBirthDate()
        );
    }
}

function generateBirthDate() {
    const aDate = 1650800000000;
    const randomDate = new Date(Math.floor(Math.random() * aDate));
    return `${randomDate.getDay()}.${randomDate.getMonth() + 1}`;
}

function generateName(isMale: boolean) {
    const firstNames = isMale ? maleFirstNames : femaleFirstNames;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    return `${firstName} ${surname}`;
}
