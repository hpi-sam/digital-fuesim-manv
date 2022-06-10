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

    it.each([true, false])(
        'should correctly apply not optimistic proposed actions when response is %p',
        async (success) => {
            const proposedAction = optimisticActionHandler.proposeAction(
                {
                    type: 'addLetter',
                    letter: 'a',
                },
                false
            );
            wordStateManager.respondToProposedAction({ success });
            expect(await proposedAction).toEqual({ success });
            // the state should only be updated via the performAction call
            expect(wordStateManager.state.word).toEqual('');
        }
    );

    it('should correctly perform actions', async () => {
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(wordStateManager.state.word).toEqual('a');

        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'b',
        });
        expect(wordStateManager.state.word).toEqual('ab');
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
        // the response from the server to the proposed action
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(wordStateManager.state.word).toEqual('a');
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
        expect(wordStateManager.state.word).toEqual('ba');
        // TODO: this is against the design contract (perform the action first, then respond to the proposed action)
        wordStateManager.respondToProposedAction({ success: true });
        await proposedAction;
        expect(wordStateManager.state.word).toEqual('ba');
        // this is the response from the server for the optimistic action sent at the beginning
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(wordStateManager.state.word).toEqual('ba');
    });

    it('should perform already proposed actions after the optimistic update is done', async () => {
        const actionA = {
            type: 'addLetter',
            letter: 'a',
        } as const;
        const actionB = {
            type: 'addLetter',
            letter: 'b',
        } as const;
        const actionC = {
            type: 'addLetter',
            letter: 'c',
        } as const;
        const actionD = {
            type: 'addLetter',
            letter: 'd',
        } as const;

        const optimisticProposalA = optimisticActionHandler.proposeAction(
            actionA,
            true
        );
        expect(wordStateManager.state.word).toEqual('a');

        const normalProposalB = optimisticActionHandler.proposeAction(
            actionB,
            false
        );
        expect(wordStateManager.state.word).toEqual('a');

        const optimisticProposalC = optimisticActionHandler.proposeAction(
            actionC,
            true
        );
        expect(wordStateManager.state.word).toEqual('ac');

        const normalProposalD = optimisticActionHandler.proposeAction(
            actionD,
            false
        );
        expect(wordStateManager.state.word).toEqual('ac');

        optimisticActionHandler.performAction(actionA);
        expect(wordStateManager.state.word).toEqual('ac');

        wordStateManager.respondToProposedAction({ success: true });
        await optimisticProposalA;
        expect(wordStateManager.state.word).toEqual('ac');
        // TODO: convert from jasmine to jest
        // expectAsync(normalProposalB).toBePending();
        // expectAsync(optimisticProposalC).toBePending();
        // expectAsync(normalProposalD).toBePending();
        console.log('___________');

        optimisticActionHandler.performAction(actionB);
        expect(wordStateManager.state.word).toEqual('abc');

        wordStateManager.respondToProposedAction({ success: true });
        await normalProposalB;
        expect(wordStateManager.state.word).toEqual('abc');
        // TODO: convert from jasmine to jest
        // expectAsync(optimisticProposalC).toBePending();
        // expectAsync(normalProposalD).toBePending();

        optimisticActionHandler.performAction(actionC);
        expect(wordStateManager.state.word).toEqual('abc');

        wordStateManager.respondToProposedAction({ success: true });
        await optimisticProposalC;
        expect(wordStateManager.state.word).toEqual('abc');
        // TODO: convert from jasmine to jest
        // expectAsync(normalProposalD).toBePending();

        optimisticActionHandler.performAction(actionD);
        expect(wordStateManager.state.word).toEqual('abcd');

        wordStateManager.respondToProposedAction({ success: true });
        await normalProposalD;
        expect(wordStateManager.state.word).toEqual('abcd');
    });
});
