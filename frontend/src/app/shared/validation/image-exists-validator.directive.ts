import { Directive } from '@angular/core';
import type { AbstractControl, AsyncValidator } from '@angular/forms';
import { NG_ASYNC_VALIDATORS } from '@angular/forms';

@Directive({
    selector: '[appImageExistsValidator]',
    providers: [
        {
            provide: NG_ASYNC_VALIDATORS,
            useExisting: ImageExistsValidatorDirective,
            multi: true,
        },
    ],
})
export class ImageExistsValidatorDirective implements AsyncValidator {
    async validate(
        control: AbstractControl
    ): Promise<ImageExistsValidatorError | null> {
        // We expect the image to not spontaneously being changing existence.
        return fetch(control.value)
            .then((response) =>
                response.status >= 200 && response.status < 300
                    ? null
                    : {
                          imageExists: {
                              url: control.value,
                              error: `Status: ${response.status}`,
                          },
                      }
            )
            .catch((error) => ({
                imageExists: {
                    url: control.value,
                    error: error?.message,
                },
            }));
    }
}

export interface ImageExistsValidatorError {
    imageExists: {
        url: string;
        error: string;
    };
}
