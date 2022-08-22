import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { Constructor } from '../constructor';

export function isValidObject<T extends object>(
    type: Constructor<T>,
    value: unknown
): boolean {
    return validateSync(plainToInstance(type, value)).length === 0;
}
