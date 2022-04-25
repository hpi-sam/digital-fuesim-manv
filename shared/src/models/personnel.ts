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
} from './utils';

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
     * if undefined, is in vehicle with {@link vehicleId}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        personnelType: PersonnelType,
        vehicleName: string,
        assignedPatientIds: UUIDSet
    ) {
        this.vehicleId = vehicleId;
        this.personnelType = personnelType;
        this.vehicleName = vehicleName;
        this.assignedPatientIds = assignedPatientIds;
        this.image = personnelTemplateMap[personnelType].image;
        this.canCaterFor = personnelTemplateMap[personnelType].canCaterFor;
    }

    static readonly create = getCreate(this);
}

const personnelTemplateMap: {
    [key in PersonnelType]: {
        image: ImageProperties;
        canCaterFor: CanCaterFor;
    };
} = {
    notSan: {
        image: {
            url: '/assets/notSan-personnel.svg',
            height: 80,
            aspectRatio: 1,
        },
        canCaterFor: CanCaterFor.create(1, 1, 4, 'or'),
    },
    retSan: {
        image: {
            url: '/assets/retSan-personnel.svg',
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
        canCaterFor: CanCaterFor.create(1, 1, 4, 'or'),
    },
    firefighter: {
        image: {
            url: '/assets/firefighter-personnel.svg',
            height: 80,
            aspectRatio: 1,
        },
        canCaterFor: CanCaterFor.create(1, 1, 4, 'or'),
    },
};
