// eslint-disable-next-line @typescript-eslint/no-shadow
import type { Element } from '../models/element';
import type { ExerciseState } from '../state';

type ElementType = Element['type'];

export const elementTypePluralMap = {
    alarmGroup: 'alarmGroups',
    client: 'clients',
    hospital: 'hospitals',
    mapImage: 'mapImages',
    material: 'materials',
    patient: 'patients',
    personnel: 'personnel',
    simulatedRegion: 'simulatedRegions',
    transferPoint: 'transferPoints',
    vehicle: 'vehicles',
    viewport: 'viewports',

    // Typescript does not allow literal types for indexes
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
} as const satisfies Record<ElementType, keyof ExerciseState>;

export type ElementTypePluralMap = typeof elementTypePluralMap;
