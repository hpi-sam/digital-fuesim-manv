import { IsString } from 'class-validator';
import {
    femaleFirstNames,
    maleFirstNames,
    unisexNames,
} from '../../data/generator-data/first-names';
import { streetNames } from '../../data/generator-data/street-names';
import { surnames } from '../../data/generator-data/surnames';
import { getCreate } from './get-create';
import type { Sex } from './sex';

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

    static generatePersonalInformation(sex: Sex): PersonalInformation {
        return PersonalInformation.create(
            generateName(sex),
            generateAddress(),
            generateBirthDate()
        );
    }
}

function generateAddress() {
    const streetName =
        streetNames[Math.floor(Math.random() * streetNames.length)];
    return `${streetName} ${Math.floor(Math.random() * 100) + 1}`;
}

function generateBirthDate() {
    const aDate = 1650800000000;
    const randomDate = new Date(Math.floor(Math.random() * aDate));
    return `${randomDate.getDate()}.${randomDate.getMonth() + 1}.`;
}

function generateName(sex: Sex) {
    const firstNames =
        sex === 'male'
            ? maleFirstNames
            : sex === 'female'
            ? femaleFirstNames
            : unisexNames;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    return `${firstName} ${surname}`;
}
