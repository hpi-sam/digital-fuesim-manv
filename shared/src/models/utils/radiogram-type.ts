import type { AllowedValues } from '../../utils/validators';

// TODO: This type should be removed once real radiogram types are implemented
export type RadiogramType = 'dummy';

export const radiogramTypeAllowedValues: AllowedValues<RadiogramType> = {
    dummy: true,
};
