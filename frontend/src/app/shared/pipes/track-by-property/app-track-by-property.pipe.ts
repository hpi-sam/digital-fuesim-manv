import type { PipeTransform, TrackByFunction } from '@angular/core';
import { Pipe } from '@angular/core';
import { get } from 'lodash-es';
import { objectToHash } from './object-to-hash';

/**
 * An Angular pipe that makes it more convenient to use the [trackByFunction](https://angular.io/api/common/NgForOf#ngForTrackBy) to improve performance of the `*ngFor` structural directive.
 *
 * Use it like this:
 *
 * @example
 *```html
 *  <div *ngFor="
 *      let item of items;
 *      trackBy: '$index' | appTrackByProperty: items
 *  ">
 *  </div>
 *```
 *
 * This is a little more complete version of [@bennadel](https://github.com/bennadel)s pipe he wrote about in his blog [here](https://www.bennadel.com/blog/3579-using-pure-pipes-to-generate-ngfor-trackby-identity-functions-in-angular-7-2-7.htm)
 * and [here](https://www.bennadel.com/blog/3580-using-pure-pipes-to-generate-ngfor-trackby-identity-functions-for-mixed-collections-in-angular-7-2-7.htm).
 *
 * Instead of declaring a trackByFunction in the component like this:
 *
 * _example.component.html_
 *
 * ```html
 * <div *ngFor="let item of items; trackBy: myTrackByFunction;">
 *     <p>{{ item }}</p>
 * </div>
 * ```
 *
 * _example.component.ts_
 *
 * ```ts
 * public myTrackByFunction(index: number, item: Item) {
 *     return item.id;
 * }
 * ```
 *
 * we just have to write code in the template:
 *
 * _example.component.html_
 *
 * ```html
 * <div *ngFor="let item of items; trackBy: 'id' | appTrackByProperty: items;">
 *     <p>{{ item }}</p>
 * </div>
 * ```
 *
 * The later solution is:
 *
 * -   less verbose
 * -   as performant as the usual way
 * -   (mostly) equally type safe
 *
 */
@Pipe({
    name: 'appTrackByProperty',
})
export class AppTrackByPropertyPipe implements PipeTransform {
    /**
     * @param propertyNames the key(s) which make an unique identifier for the item in the ngFor loop
     * 1. the literal `'$index'`: track by the position of the item in the array
     *   use case example: `readonly items: ReadonlyArray<any>`
     * 2. the literal `'$value'`: track by the value of the item. You should use this when the array is made up of primitives.
     * The items can be objects too. But they are compared by value, not by reference. So if the items are objects they should be small, to still make this somewhat performant.
     *   use case example: `items: (number | string | boolean | null | undefined)`
     * 3. a path (`string`): track by the value of the item at the specified path. The path is specified as a string where the properties are separated by a `'.'` like `'user.id'`.
     *   use case example: `items: { id: number }[]` - path: `'id'`
     *   use case example: `items: { user: { id: number; lastName: string }; house: any }[]`- path: `'user.id'`
     * 4. an array of paths (`string[]`): track by the combination of the values of the items at the specified paths.
     *   use case example: `items: { firstName: string; lastName: string }[]` - paths: `['firstName', 'lastName']`
     *   use case example: `items: { user: { firstName: string; lastName: string }; house: any }[]`- paths: `'['user.firstName', 'user.lastName']'`
     *
     * If your `trackByFunction` is more complex, you should do it the usual way and write a function in the `component.ts`.
     *
     * @param items the array that is iterated over in the `*ngFor` directive
     *   The `items` doesn't serve any runtime purpose. It is only used as a workaround for a [type parameter](https://www.typescriptlang.org/docs/handbook/2/generics.html)
     *   in angular pipes, to provide better TypeScript typings. It is optional to provide.
     * Note: The property path is currently only checked one level deep. So in case case of:
     * `type Item = { user: { id: number; lastName: string }; house: any }` - the path: `'user'` would be typesafe (= you get a type error if you remove `user` from `Item`),
     * but not the path `'user.id'` (= you could also write `user.abc` without a type error).
     *
     * @returns a trackBy function that plucks the given properties from the ngFor item
     *
     */
    public transform<
        Items extends readonly any[] = readonly any[],
        Item = Items[0],
        FirstLevelPropertyName extends number | string = keyof Item &
            (number | string),
        Path extends number | string =
            | FirstLevelPropertyName
            | `${FirstLevelPropertyName}.${string}`,
        P extends Path = Path
    >(
        propertyNames: P | P[] | '$index' | '$value',
        // only to get the type for Items, because angular pipes don't support passing types as generic parameters
        items?: Items
    ): TrackByFunction<Item> {
        // The transform function is in general called once per `trackBy:` (https://stackoverflow.com/questions/66365244/in-angular-ivy-why-pure-pipe-instance-is-not-cached-between-usages-like-in-view)
        // The here returned TrackByFunction could be called once per changeDetection cycle for each item in the ngFor loop -> should be very fast
        if (propertyNames === '$index') {
            return (index: number, item: any) => index;
        }
        if (propertyNames === '$value') {
            return (index: number, item: any) =>
                typeof item === 'object'
                    ? item === null
                        ? null
                        : // a collision would just mean that angular will use either of the two parts in the dom to render one of the collided items.
                          // This should! only result in a small performance loss.
                          objectToHash(item)
                    : item;
        }
        if (Array.isArray(propertyNames)) {
            // propertyNames is something like: ['user.firstName', 'user.lastName']
            return (index: number, item: any) =>
                propertyNames
                    .map((propertyName) => get(item, propertyName as any))
                    .join(',');
        }
        // performance improvement
        if (typeof propertyNames === 'number' || !propertyNames.includes('.')) {
            // propertyNames is something like 'user' or 1
            return (index: number, item: any) => item[propertyNames];
        }
        // propertyNames is something like: 'user.id'
        return (index: number, item: any) => get(item, propertyNames as any);
    }
}
