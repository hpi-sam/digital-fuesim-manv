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
    CanCaterFor.create(2, 2, 2, 'or'),
    0.5,
    5,
    false
);

export const materialTemplateMap: {
    [key in MaterialType]: MaterialTemplate;
} = {
    default: defaultMaterialTemplate,
};
