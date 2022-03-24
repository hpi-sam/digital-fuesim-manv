import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import type { PatientStatus } from '..';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { ImageProperties } from './utils/image-properties';
import { PersonalInformation } from './utils/personal-information';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    @Type(() => PersonalInformation)
    public personalInformation: PersonalInformation;

    public visibleStatus: PatientStatus | null;

    public realStatus: PatientStatus;

    @ValidateNested()
    @Type(() => ImageProperties)
    public image: ImageProperties;

    constructor(
        personalInformation: PersonalInformation,
        visibleStatus: PatientStatus | null,
        realStatus: PatientStatus,
        image: ImageProperties
    ) {
        this.personalInformation = personalInformation;
        this.visibleStatus = visibleStatus;
        this.realStatus = realStatus;
        this.image = image;
    }
}
