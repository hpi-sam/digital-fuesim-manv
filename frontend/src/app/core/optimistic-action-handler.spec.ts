import { OptimisticActionHandler } from './optimistic-action-handler';

/**
 * A helper class for testing the optimistic action handler.
 */
class WordStateManager {
    /**
     * The current immutable state
     */
    public state = { word: '' };

    /**
     * Applies an action to the (immutable) state
     */
    public applyAction(action: { type: 'addLetter'; letter: string }) {
        this.state = { word: this.state.word + action.letter };
    }

    /**
     * The proposed actions that are still waiting for a response
     */
    private readonly proposedActionQueue: {
        resolve: (value: { success: boolean }) => void;
    }[] = [];
    /**
     * (Would) Send a proposed action to the server
     */
    public async sendAction(action: {
        type: 'addLetter';
        letter: string;
    }): Promise<{ success: boolean }> {
        return new Promise((resolve) => {
            this.proposedActionQueue.push({
                resolve,
            });
        });
    }

    /**
     * Responds to the first proposed action that hasn't been responded to yet
     */
    public respondToProposedAction(response: { success: boolean }) {
        this.proposedActionQueue.shift()!.resolve(response);
    }
}

describe('OptimisticActionHandler', () => {
    let wordStateManager = new WordStateManager();
    let optimisticActionHandler: OptimisticActionHandler<
        {
            type: 'addLetter';
            letter: string;
        },
        { word: string },
        { success: boolean }
    >;

    beforeEach(() => {
        wordStateManager = new WordStateManager();
        optimisticActionHandler = new OptimisticActionHandler(
            (newState) => (wordStateManager.state = newState),
            () => wordStateManager.state,
            (action) => wordStateManager.applyAction(action),
            async (action) => wordStateManager.sendAction(action)
        );
    });

    it('should correctly apply not optimistic proposed actions', async () => {
        const proposedAction1 = optimisticActionHandler.proposeAction(
            {
                type: 'addLetter',
                letter: 'a',
            },
            false
        );
        wordStateManager.respondToProposedAction({ success: true });
        expect(await proposedAction1).toEqual({ success: true });
        // the state should only be updated via the performAction call
        expect(wordStateManager.state.word).toEqual('');
        const proposedAction2 = optimisticActionHandler.proposeAction(
            {
                type: 'addLetter',
                letter: '0',
            },
            false
        );
        wordStateManager.respondToProposedAction({ success: false });
        expect(await proposedAction2).toEqual({ success: false });
        expect(wordStateManager.state.word).toEqual('');
    });

    it('should correctly perform actions', async () => {
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(wordStateManager.state.word).toEqual('a');

        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(wordStateManager.state.word).toEqual('aa');
    });

    it('should correctly apply optimistic actions', async () => {
        const proposedAction = optimisticActionHandler.proposeAction(
            {
                type: 'addLetter',
                letter: 'a',
            },
            true
        );
        // should be synchronously applied
        expect(wordStateManager.state.word).toEqual('a');
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(wordStateManager.state.word).toEqual('aa');
        wordStateManager.respondToProposedAction({ success: true });
        await proposedAction;
        expect(wordStateManager.state.word).toEqual('a');
    });

    it('should keep the right order when applying optimistic updates and performed updates', async () => {
        const proposedAction = optimisticActionHandler.proposeAction(
            {
                type: 'addLetter',
                letter: 'a',
            },
            true
        );
        expect(wordStateManager.state.word).toEqual('a');
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'b',
        });
        expect(wordStateManager.state.word).toEqual('ab');
        wordStateManager.respondToProposedAction({ success: true });
        await proposedAction;
        expect(wordStateManager.state.word).toEqual('b');
        // this is the response from the server for the optimistic action send at the beginning
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(wordStateManager.state.word).toEqual('ba');
    });

    it('should perform already proposed actions after the optimised update is done', async () => {
        const action1 = {
            type: 'addLetter',
            letter: 'a',
        } as const;
        const action2 = {
            type: 'addLetter',
            letter: 'b',
        } as const;
        const action3 = {
            type: 'addLetter',
            letter: 'c',
        } as const;
        const action4 = {
            type: 'addLetter',
            letter: 'd',
        } as const;

        const optimisticAction1 = optimisticActionHandler.proposeAction(
            action1,
            true
        );
        expect(wordStateManager.state.word).toEqual('a');

        const normalAction2 = optimisticActionHandler.proposeAction(
            action2,
            false
        );
        expect(wordStateManager.state.word).toEqual('a');

        const optimisticAction3 = optimisticActionHandler.proposeAction(
            action3,
            true
        );
        expect(wordStateManager.state.word).toEqual('ac');

        const normalAction4 = optimisticActionHandler.proposeAction(
            action4,
            false
        );
        expect(wordStateManager.state.word).toEqual('ac');

        optimisticActionHandler.performAction(action1);
        expect(wordStateManager.state.word).toEqual('aca');

        wordStateManager.respondToProposedAction({ success: true });
        await optimisticAction1;
        expect(wordStateManager.state.word).toEqual('ac');
        expectAsync(normalAction2).toBePending();
        expectAsync(optimisticAction3).toBePending();
        expectAsync(normalAction4).toBePending();

        optimisticActionHandler.performAction(action2);
        expect(wordStateManager.state.word).toEqual('acb');

        wordStateManager.respondToProposedAction({ success: true });
        await normalAction2;
        expect(wordStateManager.state.word).toEqual('acb');
        expectAsync(optimisticAction3).toBePending();
        expectAsync(normalAction4).toBePending();

        optimisticActionHandler.performAction(action3);
        expect(wordStateManager.state.word).toEqual('acbc');

        wordStateManager.respondToProposedAction({ success: true });
        await optimisticAction3;
        expect(wordStateManager.state.word).toEqual('abc');
        expectAsync(normalAction4).toBePending();

        optimisticActionHandler.performAction(action4);
        expect(wordStateManager.state.word).toEqual('abcd');

        wordStateManager.respondToProposedAction({ success: true });
        await normalAction4;
        expect(wordStateManager.state.word).toEqual('abcd');
    });
});
