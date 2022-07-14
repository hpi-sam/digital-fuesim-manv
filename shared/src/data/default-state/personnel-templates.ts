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
    CanCaterFor.create(0, 0, 5, 'or'),
    2.5,
    5.5,
    false
);

const rettSanPersonnelTemplate = PersonnelTemplate.create(
    'rettSan',
    {
        url: '/assets/rettSan-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(1, 2, 0, 'and'),
    2.5,
    5,
    false
);

const notSanPersonnelTemplate = PersonnelTemplate.create(
    'notSan',
    {
        url: '/assets/notSan-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(2, 1, 0, 'and'),
    2.5,
    5.5,
    false
);

const notarztPersonnelTemplate = PersonnelTemplate.create(
    'notarzt',
    {
        url: '/assets/notarzt-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(2, 2, 2, 'and'),
    15,
    0,
    true
);

const gfPersonnelTemplate = PersonnelTemplate.create(
    'gf',
    {
        url: '/assets/gf-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(0, 0, 0, 'or'),
    0,
    0,
    false
);

export const personnelTemplateMap: {
    [key in PersonnelType]: PersonnelTemplate;
} = {
    san: sanPersonnelTemplate,
    rettSan: rettSanPersonnelTemplate,
    notSan: notSanPersonnelTemplate,
    notarzt: notarztPersonnelTemplate,
    gf: gfPersonnelTemplate,
};
