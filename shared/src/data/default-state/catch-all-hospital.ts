import type { Hospital } from '../../models';
import type { UUID } from '../../utils';
import { cloneDeepMutable } from '../../utils';

export const catchAllHospitalId: UUID = '00000000-0000-4000-8000-000000000000';

const catchAllHospital: Hospital = {
    type: 'hospital',
    id: catchAllHospitalId,
    name: 'Beliebiges Krankenhaus',
    transportDuration: 60 * 60 * 1000,
    patientIds: {},
};

export function createCatchAllHospital() {
    return cloneDeepMutable(catchAllHospital);
}
