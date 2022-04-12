import type { Constructor } from '../../utils';

export function getCreate<T extends Constructor>(aClass: T) {
    return (...args: ConstructorParameters<T>) => ({ ...new aClass(...args) });
}
