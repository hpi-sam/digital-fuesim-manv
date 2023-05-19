/**
 * Please use a function from {@link ./utils/tag-helpers.ts} to create a tag for a specific category.
 */
export class Tag {
    public category: string;

    // This should be a color from https://getbootstrap.com/docs/5.2/customize/color/
    public color: string;

    public name: string;

    public specifier: string;

    constructor(category: string, color: string, name: string, specifier: string) {
        this.category = category;
        this.color = color;
        this.name = name;
        this.specifier = specifier;
    }
}
