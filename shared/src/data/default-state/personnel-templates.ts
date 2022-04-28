import { CanCaterFor } from '../../models/utils';
import type { PersonnelType, ImageProperties } from '../../models/utils';

export const personnelTemplateMap: {
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
