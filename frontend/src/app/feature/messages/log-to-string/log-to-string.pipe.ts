import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'logToString',
})
export class LogToStringPipe implements PipeTransform {
    transform = logToStringPipeTransform;
}
