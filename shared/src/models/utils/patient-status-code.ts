import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import type { Immutable } from 'immer';
import { cloneDeepImmutable } from '../../utils';
import type { AllowedValues } from '../../utils/validators';
import { IsLiteralUnion } from '../../utils/validators';
import { getCreate } from './get-create';

/**
 * A letter that defines the color of a patient in a patient status.
 * * `V`: ex (black)
 * * `W`: SK IV (blue)
 * * `X`: SK III (green)
 * * `Y`: SK II (yellow)
 * * `Z`: SK I (red)
 */
export type ColorCode = 'V' | 'W' | 'X' | 'Y' | 'Z';
const colorCodeAllowedValues: AllowedValues<ColorCode> = {
    V: true,
    W: true,
    X: true,
    Y: true,
    Z: true,
};

/**
 * A letter that defines how a patients changes
 * * `A`: stable
 * * `B`: treatment required
 * * `C`: transport priority
 * * `D`: complication
 * * `E`: dead
 */
export type BehaviourCode = 'A' | 'B' | 'C' | 'D' | 'E';
const behaviourCodeAllowedValues: AllowedValues<BehaviourCode> = {
    A: true,
    B: true,
    C: true,
    D: true,
    E: true,
};

type Tag = 'P';
const tagAllowedValues: AllowedValues<Tag> = {
    P: true,
};

export type Tags = Immutable<Tag[]>;

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

    @IsArray()
    @IsLiteralUnion(tagAllowedValues, {
        each: true,
    })
    public readonly tags!: Tags;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(code: string) {
        // Plain to Instance calls constructors without arguments, therefore we have to catch it
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        this.tags = cloneDeepImmutable([...code.slice(6)]) as Tags;
    }

    static readonly create = getCreate(this);
}
