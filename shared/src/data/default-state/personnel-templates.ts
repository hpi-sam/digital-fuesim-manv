import { PersonnelTemplate } from '../../models/personnel-template.js';
import { CanCaterFor } from '../../models/utils/cater-for.js';
import type { PersonnelType } from '../../models/utils/personnel-type.js';
import {
    defaultOverrideTreatmentRange,
    defaultTreatmentRange,
} from './default-treatment-range.js';

const sanPersonnelTemplate = PersonnelTemplate.create(
    'san',
    {
        url: '/assets/san-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(0, 0, 5, 'and'),
    defaultOverrideTreatmentRange,
    defaultTreatmentRange
);

const rettSanPersonnelTemplate = PersonnelTemplate.create(
    'rettSan',
    {
        url: '/assets/rettSan-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(1, 2, 0, 'and'),
    defaultOverrideTreatmentRange,
    defaultTreatmentRange
);

const notSanPersonnelTemplate = PersonnelTemplate.create(
    'notSan',
    {
        url: '/assets/notSan-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(2, 1, 0, 'and'),
    defaultOverrideTreatmentRange,
    defaultTreatmentRange
);

const notarztPersonnelTemplate = PersonnelTemplate.create(
    'notarzt',
    {
        url: '/assets/notarzt-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(2, 2, 2, 'and'),
    defaultOverrideTreatmentRange,
    15
);

const gfPersonnelTemplate = PersonnelTemplate.create(
    'gf',
    {
        url: '/assets/gf-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(0, 0, 0, 'and'),
    0,
    0
);

export const defaultPersonnelTemplates: {
    [key in PersonnelType]: PersonnelTemplate;
} = {
    san: sanPersonnelTemplate,
    rettSan: rettSanPersonnelTemplate,
    notSan: notSanPersonnelTemplate,
    notarzt: notarztPersonnelTemplate,
    gf: gfPersonnelTemplate,
};
