import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { formatDuration } from 'digital-fuesim-manv-shared';

@Pipe({
    name: 'formatDuration',
    standalone: false,
})
export class FormatDurationPipe implements PipeTransform {
    /**
     *
     * @param duration in ms
     */
    transform(duration: number): string {
        return formatDuration(duration);
    }
}
