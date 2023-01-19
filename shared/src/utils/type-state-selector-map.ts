export const typeSelectorMap = {
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
} as const;

export type TypeSelectorMap = typeof typeSelectorMap;
