import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ChatMessage } from './chat-message';
import { Chat } from './chat.actions';

export interface ChatStateModel {
    messages: ChatMessage[];
}

@State<ChatStateModel>({
    name: 'chat',
    defaults: {
        messages: [],
    },
})
export class ChatState {
    // this is memoized
    @Selector()
    static messages(state: ChatStateModel) {
        return state.messages;
    }

    @Action(Chat.WriteMessage)
    add(
        { getState, patchState }: StateContext<ChatStateModel>,
        { payload }: Chat.WriteMessage
    ) {
        const state = getState();
        patchState({
            messages: [...state.messages, payload],
        });
    }
}
