import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageService } from 'src/app/core/messages/message.service';
import { fade } from '../animations/fade';

/**
 * This component should only be used once in the application. The alerts are positioned independently from the occurrence of the component
 * absolute to the viewport
 */
@Component({
    selector: 'app-alerts',
    templateUrl: './alerts.component.html',
    styleUrls: ['./alerts.component.scss'],
    animations: [fade()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsComponent {
    constructor(public messageService: MessageService) {}
}
