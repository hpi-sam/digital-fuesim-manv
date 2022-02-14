import { Injectable } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { CustomTimer } from './custom-timer';
import type { MessageConfig } from './message';
import { Message } from './message';

@Injectable({ providedIn: 'root' })
export class MessageService {
    private toastMessages: ReadonlyArray<Message> = [];
    /**
     * A list of messages that should be displayed as toast
     * old -> new
     */
    public readonly toastMessages$ = new BehaviorSubject(this.toastMessages);
    private alertMessages: ReadonlyArray<Message> = [];
    /**
     * A list of messages that should be displayed as alerts
     * new -> old
     */
    public alertMessages$ = new BehaviorSubject(this.toastMessages);
    private readonly defaultTimeout = 5 * 1000;

    /**
     * @param message the message that should be posted, multiple similar messages get stacked
     * @param type `toasts` are small messages displayed at the top-right, `alerts` are very prominently displayed at the bottom-center
     * @param timeout After which time should the message automatically disappear? (The message can always be closed manually by the user)
     * null: never
     * number: after ... ms
     * -> the highest timeout always wins in stacked messages
     * @returns the message-object that got created
     */
    public postMessage(
        config: MessageConfig,
        type: MessageType = 'toast',
        timeout: number | null = this.defaultTimeout
    ): Message {
        const messages = [
            ...(type === 'toast' ? this.toastMessages : this.alertMessages),
        ];
        let newestMessage: Message | undefined =
            type === 'toast' ? messages[messages.length - 1] : messages[0];
        if (!newestMessage || !isEqual(newestMessage.config, config)) {
            newestMessage = new Message(config);
            if (type === 'toast') {
                messages.push(newestMessage);
            } else {
                messages.unshift(newestMessage);
            }
        } else {
            newestMessage.amount++;
        }
        if (timeout === null) {
            newestMessage.timer?.destroy();
            newestMessage.timer = undefined;
        } else if (
            !newestMessage.timer ||
            newestMessage.timer.getTimeLeft() < timeout
        ) {
            const wasPaused = newestMessage.timer?.isPaused;
            newestMessage.timer?.destroy();
            newestMessage.timer = new CustomTimer(
                () => this.removeMessage(newestMessage!.id, type),
                timeout
            );
            if (wasPaused) {
                newestMessage.timer.pause();
            }
        }
        this.setMessages(messages, type);
        return newestMessage;
    }

    public removeMessage(id: UUID, type: MessageType) {
        const messages = [
            ...(type === 'toast' ? this.toastMessages : this.alertMessages),
        ];
        const index = messages.findIndex((m) => m.id === id);
        if (index < 0) {
            console.error(`Cannot remove message ${id} - Unknown id!`);
            return;
        }
        messages.splice(index, 1);
        this.setMessages(messages, type);
    }

    private setMessages(
        newMessages: ReadonlyArray<Message>,
        type: MessageType
    ) {
        if (type === 'alert') {
            this.alertMessages = newMessages;
            this.alertMessages$.next(newMessages);
        }
        if (type === 'toast') {
            this.toastMessages = newMessages;
            this.toastMessages$.next(newMessages);
        }
    }
}

type MessageType = 'alert' | 'toast';
