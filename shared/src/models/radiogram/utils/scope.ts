export type Scope = 'singleRegion' | 'transportManagement';

export const scopeAllowedValues = {
    singleRegion: true,
    transportManagement: true,
} as const;
