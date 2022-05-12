import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'formatDuration',
})
export class FormatDurationPipe implements PipeTransform {
    /**
     *
     * @param duration in ms
     */
    transform(duration: number): string {
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const secondsStr = seconds % 60;
        const minutesStr = minutes % 60;
        const hoursStr = hours % 24;
        const daysStr = days;

        const parts = [];
        if (daysStr > 0) {
            parts.push(`${daysStr}${thinSpace}d`);
        }
        if (hoursStr > 0) {
            parts.push(`${hoursStr}${thinSpace}h`);
        }
        if (minutesStr > 0) {
            parts.push(`${minutesStr}${thinSpace}min`);
        }
        // we only want to show seconds if there are no other parts because they change too fast
        if (secondsStr > 0 && parts.length === 0) {
            parts.push(`${secondsStr}${thinSpace}s`);
        }
        if (parts.length === 0) {
            return `0${thinSpace}s`;
        }

        return parts.join(' ');
    }
}

const thinSpace = `\u2009`;
