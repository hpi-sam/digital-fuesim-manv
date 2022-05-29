import type { ValidatorOptions } from 'class-validator';

export const defaultValidateOptions: ValidatorOptions = {
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
    whitelist: true,
};
