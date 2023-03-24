import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-radiogram-card-content-fallback',
    templateUrl: './radiogram-card-content-fallback.component.html',
    styleUrls: ['./radiogram-card-content-fallback.component.scss'],
})
export class RadiogramCardContentFallbackComponent {
    @Input() radiogramType!: string;
}
