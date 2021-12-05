import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChatMessage } from 'src/app/store/chat/chat-message';
import { Chat } from 'src/app/store/chat/chat.actions';
import { ChatState, ChatStateModel } from 'src/app/store/chat/chat.state';

const numberOfMessagesSelector = (state: ChatStateModel) =>
    state.messages.length;

@Component({
    selector: 'app-display-chat-messages',
    templateUrl: './display-chat-messages.component.html',
    styleUrls: ['./display-chat-messages.component.scss'],
})
export class DisplayChatMessagesComponent {
    // Select
    /**
     * Solution 1: decorator style
     */
    @Select(ChatState.messages) public readonly messages1$!: SelectType<
        // It is important that the argument in the `@Select` decorator is the same as in the `SelectType` function!
        typeof ChatState.messages
    >;
    @Select(numberOfMessagesSelector)
    public readonly numberOfMessages1$!: SelectType<
        typeof numberOfMessagesSelector
    >;

    // or

    /**
     * Solution 2: property style
     */
    public readonly messages$!: Observable<ChatMessage[]>;
    public readonly numberOfMessages$!: Observable<number>;

    constructor(private store: Store) {
        this.messages$ = this.store.select(ChatState.messages);
        this.numberOfMessages$ = this.store.select(
            (state: ChatStateModel) => state.messages.length
        );
    }

    // Action
    public writeMessage(message: ChatMessage) {
        this.store.dispatch(new Chat.WriteMessage(message));
    }
}

/**
 * The `@Select` decorator cannot infer the type of the selector (https://github.com/ngxs/store/issues/1719 , https://github.com/ngxs/store/issues/1765).
 * Therefore we have to do it ourselves via this helper type.
 */
type SelectType<T extends (...args: any[]) => any> = Observable<ReturnType<T>>;
