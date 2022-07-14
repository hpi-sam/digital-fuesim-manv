import { CanCaterFor } from '../../models/utils';
import { MaterialTemplate } from '../../models/material-template';
import type { MaterialType } from '../../models/utils/material-type';

const defaultMaterialTemplate = MaterialTemplate.create(
    'default',
    {
        url: '/assets/material.svg',
        height: 40,
        aspectRatio: 1,
    },
    CanCaterFor.create(2, 0, 0, 'and'),
    2.5,
    5.5,
    false
);

const bigMaterialTemplate = MaterialTemplate.create(
    'big',
    {
        url: '/assets/material.svg',
        height: 80,
        aspectRatio: 1,
    },
    CanCaterFor.create(2, 2, 0, 'and'),
    15,
    0,
    true
);

export const materialTemplateMap: {
    [key in MaterialType]: MaterialTemplate;
} = {
    default: defaultMaterialTemplate,
    big: bigMaterialTemplate,
};
