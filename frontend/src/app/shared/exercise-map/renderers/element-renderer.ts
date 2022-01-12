/**
 * Provides an Api to render an element
 */
export abstract class ElementRenderer<Element extends object> {
    abstract createElement(element: Element): void;
    abstract deleteElement(element: Element): void;

    public changeElement(oldElement: Element, newElement: Element): void {
        this.deleteElement(oldElement);
        this.createElement(newElement);
    }
}
