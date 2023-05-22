/**
 * Please use a function from {@link ./utils/tag-helpers.ts} to create a tag for a specific category.
 */
export class Tag {
    public category: string;

    /**
     * The color of the tag.
     * This should be a valid value
     * for the css color property
     * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color}
     */
    public color: string;

    public name: string;

    public specifier: string;

    constructor(
        category: string,
        color: string,
        name: string,
        specifier: string
    ) {
        this.category = category;
        this.color = color;
        this.name = name;
        this.specifier = specifier;
    }
}
