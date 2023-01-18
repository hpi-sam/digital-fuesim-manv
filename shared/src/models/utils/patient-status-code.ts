import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import type { AllowedValues } from '../../utils/validators';
import { IsLiteralUnion } from '../../utils/validators';
import { getCreate } from './get-create';

type ColorCode = 'V' | 'W' | 'X' | 'Y' | 'Z';
const colorCodeAllowedValues: AllowedValues<ColorCode> = {
    V: true,
    W: true,
    X: true,
    Y: true,
    Z: true,
};
type BehaviourCode = 'A' | 'B' | 'C' | 'D' | 'E';
const behaviourCodeAllowedValues: AllowedValues<BehaviourCode> = {
    A: true,
    B: true,
    C: true,
    D: true,
    E: true,
};

export const colorCodeMap = {
    V: 'black',
    W: 'blue',
    X: 'green',
    Y: 'yellow',
    Z: 'red',
} as const satisfies { readonly [Key in ColorCode]: string };

export const behaviourCodeMap: { [Key in BehaviourCode]: string } = {
    A: 'bi-arrow-right-square-fill',
    B: 'bi-heartbreak-fill',
    C: 'bi-exclamation-circle-fill',
    D: 'bi-exclamation-triangle-fill',
    E: 'bi-x-circle-fill',
};

export class PatientStatusDataField {
    @IsLiteralUnion(colorCodeAllowedValues)
    public readonly colorCode: ColorCode;

    @IsLiteralUnion(behaviourCodeAllowedValues)
    public readonly behaviourCode: BehaviourCode;

    /**
     * @deprecated Use {@link create} instead
     */
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

    /**
     * @deprecated Use {@link create} instead
     */
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
