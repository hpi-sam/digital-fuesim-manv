import type { PersonnelType } from '../../models/utils';
import { CanCaterFor } from '../../models/utils';
import { PersonnelTemplate } from '../../models/personnel-template';
import {
    defaultOverrideTreatmentRange,
    defaultTreatmentRange,
} from './default-treatment-range';

const sanPersonnelTemplate = PersonnelTemplate.create(
    'san',
    {
        url: '/assets/san-personnel.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(0.3),
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
    CanCaterFor.create(0.8),
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
    CanCaterFor.create(1),
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
    CanCaterFor.create(1.2),
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
    CanCaterFor.create(0),
    0,
    0
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
