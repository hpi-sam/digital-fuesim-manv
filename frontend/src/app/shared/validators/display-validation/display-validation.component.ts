import { Input, Component } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
    selector: 'app-display-validation',
    templateUrl: './display-validation.component.html',
    styleUrls: ['./display-validation.component.scss'],
})
export class DisplayValidationComponent {
    @Input() ngModelInput!: NgModel;
}
