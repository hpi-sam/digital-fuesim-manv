import type { AllowedValues } from '../../utils/validators';

export type Role = 'participant' | 'trainer';
export const roleAllowedValues: AllowedValues<Role> = {
    participant: true,
    trainer: true,
};
