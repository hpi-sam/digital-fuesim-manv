import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'keys',
})
export class KeysPipe implements PipeTransform {
    /**
     * @param object The **immutable** object to get the keys from
     * @returns an array of the keys in the object in their original order
     */
    // Accepts undefined and null too, to make it easier to use in templates with e.g. | async
    transform<Value extends { [key: string]: any } | null | undefined>(
        object: Value
    ): Value extends null | undefined ? Value : (keyof Value)[] {
        if (!object) {
            return object as any;
        }
        return Object.keys(object) as any;
    }
}
