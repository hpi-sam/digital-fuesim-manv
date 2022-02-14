import { uuid } from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';
import type { CustomTimer } from './custom-timer';

export interface MessageConfig {
    title: string;
    body?: string;
    /**
     * The 'click'-event will be emitted over {@link event$}
     */
    button?: {
        /**
         * The text that should appear of the button. The 'click'-event will be emitted over {@link event$}
         */
        name: string;
        color:
            | 'danger'
            | 'info'
            | 'primary'
            | 'secondary'
            | 'success'
            | 'warning';
    };
    /**
     * A json-value that should be logged (e.g. for errors)
     */
    logValue?: unknown;
    /**
     * The styling of the message
     */
    color: 'danger' | 'info' | 'success' | 'warning';
}

export class Message {
    public id = uuid();
    /**
     * The number of similar messages (= same config) that have been posted
     */
    public amount = 1;
    public timer?: CustomTimer;
    public readonly event$ = new Subject<'click'>();

    constructor(public readonly config: MessageConfig) {}

    public destroy() {
        this.timer?.destroy();
    }
}
