import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-error-404',
    templateUrl: './error-404.component.html',
    styleUrls: ['./error-404.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Error404Component {}
