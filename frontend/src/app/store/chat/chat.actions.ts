import { ChatMessage } from './chat-message';

export namespace Chat {
    export class WriteMessage {
        static readonly type = '[Chat] Write Message';

        constructor(public payload: ChatMessage) {}
    }
}
