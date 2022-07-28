import type { OnDestroy } from '@angular/core';
import { Directive, EventEmitter, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

/**
 * This directive should be used when values should be autosaved while the user types into the input.
 * The emitted event is the value that should be saved.
 * It is already checked for validity (form Validators) and the type events are debounced.
 *
 * @example
 * ```html
 * <input
 *   [ngModel]="myValue"
 *   (appSaveOnTyping)="myValueHasChangedAndIsValid($event)"
 *   required
 *   type="text"
 * />
 *
 * ```
 *
 * Inspired by https://stackoverflow.com/a/65079996
 */
@Directive({
    selector: '[appSaveOnTyping][ngModel]',
})
export class AppSaveOnTypingDirective implements OnDestroy {
    destroy$ = new Subject<void>();
    @Output() readonly appSaveOnTyping: EventEmitter<any> = new EventEmitter();

    constructor(ngModel: NgModel) {
        ngModel.update
            .pipe(
                // Keeping a key (like backspace) pressed for a more than a certain threshold will result in many key presses
                // The debounceTime should be above that threshold to not register the initial keypress as the first update
                debounceTime(600),
                filter(() => ngModel.valid === true),
                takeUntil(this.destroy$)
            )
            .subscribe(this.appSaveOnTyping);
    }

    ngOnDestroy() {
        this.destroy$.next();
    }
}
