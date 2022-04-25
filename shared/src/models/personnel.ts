import { Type } from 'class-transformer';
import {
    IsDefined,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { UUID, UUIDSet, uuid, uuidValidationOptions } from '../utils';
import {
    CanCaterFor,
    Position,
    ImageProperties,
    PersonnelType,
    getCreate,
    Transfer,
} from './utils';

const personnelTemplateMap: {
    [key in PersonnelType]: {
        image: ImageProperties;
        canCaterFor: CanCaterFor;
    };
} = {
    san: {
        image: {
            url: '/assets/san-personnel.svg',
            height: 80,
            aspectRatio: 1,
        },
        canCaterFor: CanCaterFor.create(1, 1, 4, 'or'),
    },
    notSan: {
        image: {
            url: '/assets/notSan-personnel.svg',
            height: 80,
            aspectRatio: 1,
        },
        canCaterFor: CanCaterFor.create(1, 1, 4, 'or'),
    },
    rettSan: {
        image: {
            url: '/assets/rettSan-personnel.svg',
            height: 80,
            aspectRatio: 1,
        },
        canCaterFor: CanCaterFor.create(1, 1, 4, 'or'),
    },
    notarzt: {
        image: {
            url: '/assets/notarzt-personnel.svg',
            height: 80,
            aspectRatio: 1,
        },
        canCaterFor: CanCaterFor.create(1, 1, 4, 'or'),
    },
    gf: {
        image: {
            url: '/assets/gf-personnel.svg',
            height: 80,
            aspectRatio: 1,
        },
        canCaterFor: CanCaterFor.create(0, 0, 0, 'or'),
    },
};

export class Personnel {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId: UUID;

    // TODO
    @IsString()
    public readonly personnelType: PersonnelType;

    @IsString()
    public readonly vehicleName: string;

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    @IsDefined()
    public readonly assignedPatientIds: UUIDSet;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly canCaterFor: CanCaterFor;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * if undefined, is in vehicle with {@link vehicleId} or in transfer
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    /**
     * Exclusive-or to {@link position}
     */
    @ValidateNested()
    @Type(() => Transfer)
    @IsOptional()
    public readonly transfer?: Transfer;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        vehicleName: string,
        personnelType: PersonnelType,
        assignedPatientIds: UUIDSet
    ) {
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.personnelType = personnelType;
        this.assignedPatientIds = assignedPatientIds;
        this.image = personnelTemplateMap[personnelType].image;
        this.canCaterFor = personnelTemplateMap[personnelType].canCaterFor;
    }

    static readonly create = getCreate(this);

    static isInVehicle(personnel: Personnel): boolean {
        return (
            personnel.position === undefined && personnel.transfer === undefined
        );
    }
}
