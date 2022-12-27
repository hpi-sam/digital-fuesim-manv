export type MaterialType = 'big' | 'standard';
export const materialTypeNames: {
    [key in MaterialType]: string;
} = {
    big: 'Groß',
    standard: 'Standard',
};
