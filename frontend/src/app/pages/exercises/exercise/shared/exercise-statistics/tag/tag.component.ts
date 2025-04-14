import { Component, Input } from '@angular/core';
import { Tag } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-tag',
    templateUrl: './tag.component.html',
    styleUrls: ['./tag.component.scss'],
    standalone: false,
})
export class TagComponent {
    @Input() tag!: Tag;
}
