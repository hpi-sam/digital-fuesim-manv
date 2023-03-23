import { Component, Input } from '@angular/core';
import { ExerciseRadiogram } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-radiogram-card-content',
    templateUrl: './radiogram-card-content.component.html',
    styleUrls: ['./radiogram-card-content.component.scss'],
})
export class RadiogramCardContentComponent {
    @Input() radiogram!: ExerciseRadiogram;
}
