import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { getCreate } from './get-create';

type ColorCode = 'V' | 'W' | 'X' | 'Y' | 'Z';
type BehaviourCode = 'A' | 'B' | 'C' | 'D' | 'E';
class PatientStatusDataField {
    @IsString()
    public readonly colorCode: ColorCode;

    @IsString()
    public readonly behaviourCode: BehaviourCode;

    constructor(colorCode: ColorCode, behaviourCode: BehaviourCode) {
        this.colorCode = colorCode;
        this.behaviourCode = behaviourCode;
    }

    static readonly create = getCreate(this);
}

export class PatientStatusCode {
    @ValidateNested()
    @Type(() => PatientStatusDataField)
    public readonly firstField!: PatientStatusDataField;

    @ValidateNested()
    @Type(() => PatientStatusDataField)
    public readonly secondField!: PatientStatusDataField;

    @ValidateNested()
    @Type(() => PatientStatusDataField)
    public readonly thirdField!: PatientStatusDataField;

    constructor(code: string) {
        // Plain to Instance calls constructors without arguments, therefore we have to catch it
        if (code === undefined) {
            return;
        }
        this.firstField = PatientStatusDataField.create(
            code[0] as ColorCode,
            code[1] as BehaviourCode
        );
        this.secondField = PatientStatusDataField.create(
            code[2] as ColorCode,
            code[3] as BehaviourCode
        );
        this.thirdField = PatientStatusDataField.create(
            code[4] as ColorCode,
            code[5] as BehaviourCode
        );
    }

    static readonly create = getCreate(this);
}
