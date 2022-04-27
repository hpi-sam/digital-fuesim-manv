import type { TileMapProperties } from '../../models';

export const defaultTileMapProperties: TileMapProperties = {
    tileUrl:
        'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1IjoiZGFzc2RlcmRpZSIsImEiOiJja3dzNnZsM3ExM3BzMnBxb3lsZTAwZnN0In0.64CnzzdAgbmKwNkldgS5cg',
    maxZoom: 20,
};
