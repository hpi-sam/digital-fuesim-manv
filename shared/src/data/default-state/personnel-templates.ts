import type { PersonnelType } from '../../models/utils';
import { CanCaterFor } from '../../models/utils';
import { PersonnelTemplate } from '../../models/personnel-template';

const sanPersonnelTemplate = PersonnelTemplate.create(
    'san',
    {
        url: '/assets/san-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(1, 1, 4, 'or')
);

const notSanPersonnelTemplate = PersonnelTemplate.create(
    'notSan',
    {
        url: '/assets/notSan-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(1, 1, 4, 'or')
);

const rettSanPersonnelTemplate = PersonnelTemplate.create(
    'rettSan',
    {
        url: '/assets/rettSan-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(1, 1, 4, 'or')
);

const notarztPersonnelTemplate = PersonnelTemplate.create(
    'notarzt',
    {
        url: '/assets/notarzt-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(1, 1, 4, 'or')
);

const gfPersonnelTemplate = PersonnelTemplate.create(
    'gf',
    {
        url: '/assets/gf-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(0, 0, 0, 'or')
);

export const personnelTemplateMap: {
    [key in PersonnelType]: {
        PersonnelTemplate: PersonnelTemplate;
    };
} = {
    san: { PersonnelTemplate: sanPersonnelTemplate },
    notSan: { PersonnelTemplate: notSanPersonnelTemplate },
    rettSan: { PersonnelTemplate: rettSanPersonnelTemplate },
    notarzt: { PersonnelTemplate: notarztPersonnelTemplate },
    gf: { PersonnelTemplate: gfPersonnelTemplate },
};
