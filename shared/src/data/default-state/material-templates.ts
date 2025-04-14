import { CanCaterFor } from '../../models/utils/index.js';
import { MaterialTemplate } from '../../models/material-template.js';
import type { MaterialType } from '../../models/utils/material-type.js';
import {
    defaultOverrideTreatmentRange,
    defaultTreatmentRange,
} from './default-treatment-range.js';

const standardMaterialTemplate = MaterialTemplate.create(
    'standard',
    {
        url: '/assets/material.svg',
        height: 35,
        aspectRatio: 1,
    },
    CanCaterFor.create(2, 0, 0, 'and'),
    defaultOverrideTreatmentRange,
    defaultTreatmentRange
);

const bigMaterialTemplate = MaterialTemplate.create(
    'big',
    {
        url: '/assets/big-material.svg',
        height: 35,
        aspectRatio: 1,
    },
    CanCaterFor.create(2, 2, 0, 'and'),
    defaultOverrideTreatmentRange,
    10
);

export const defaultMaterialTemplates: {
    [key in MaterialType]: MaterialTemplate;
} = {
    standard: standardMaterialTemplate,
    big: bigMaterialTemplate,
};
