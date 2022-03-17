import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageService } from 'src/app/core/messages/message.service';
import { fade } from '../animations/fade';

/**
 * This component should only be used once in the application. The toasts are positioned independently from the occurrence of the component
 * absolute to the viewport
 */
@Component({
    selector: 'app-toasts',
    templateUrl: './toasts.component.html',
    styleUrls: ['./toasts.component.scss'],
    animations: [fade()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastsComponent {
    constructor(public readonly messageService: MessageService) {}
}
