import { Directive } from '@angular/core';
import type { AbstractControl, AsyncValidator } from '@angular/forms';
import { NG_ASYNC_VALIDATORS } from '@angular/forms';
import { ApiService } from 'src/app/core/api.service';

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
    constructor(private readonly apiService: ApiService) {}

    async validate(
        control: AbstractControl
    ): Promise<ImageExistsValidatorError | null> {
        // We expect the image to not spontaneously being changing existence.
        return this.apiService.getUrlStatus(control.value).then((status) =>
            status >= 200 && status < 300
                ? null
                : {
                      imageExists: {
                          url: control.value,
                          status,
                      },
                  }
        );
    }
}

export interface ImageExistsValidatorError {
    imageExists: {
        url: string;
        status: number;
    };
}
