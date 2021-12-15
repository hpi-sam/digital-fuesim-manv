import { OptimisticActionHandler } from './optimistic-action-handler';

describe('OptimisticActionHandler', () => {
    let state = { word: '' };
    /**
     * The proposed action fails always if the letter is `0`
     */
    let optimisticActionHandler: OptimisticActionHandler<
        {
            type: 'addLetter';
            letter: string;
        },
        { word: string },
        { success: boolean }
    >;

    beforeEach(() => {
        state = { word: '' };
        optimisticActionHandler = new OptimisticActionHandler(
            (newState) => (state = newState),
            () => state,
            (action) => {
                // this has to be immutable
                state = { word: state.word + action.letter };
            },
            async (action) => {
                if (action.letter === '0') {
                    return { success: false };
                }
                return { success: true };
            }
        );
    });

    it('should correctly apply not optimistic proposed actions', async () => {
        expect(
            await optimisticActionHandler.proposeAction(
                {
                    type: 'addLetter',
                    letter: 'a',
                },
                false
            )
        ).toEqual({ success: true });
        // the state should only be updated via the performAction call
        expect(state.word).toEqual('');
        expect(
            await optimisticActionHandler.proposeAction(
                {
                    type: 'addLetter',
                    letter: '0',
                },
                false
            )
        ).toEqual({ success: false });
        expect(state.word).toEqual('');
    });

    it('should correctly perform an action', async () => {
        await optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(state.word).toEqual('a');

        await optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(state.word).toEqual('aa');
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
        expect(state.word).toEqual('a');
        await proposedAction;
        expect(state.word).toEqual('');
        await optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(state.word).toEqual('a');
    });

    it('should keep the right order when applying optimistic updates and performed updates', async () => {
        const proposedAction = optimisticActionHandler.proposeAction(
            {
                type: 'addLetter',
                letter: 'a',
            },
            true
        );
        expect(state.word).toEqual('a');
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'b',
        });
        expect(state.word).toEqual('ab');
        await proposedAction;
        expect(state.word).toEqual('b');
        // this is the response from the server for the optimistic action send at the beginning
        optimisticActionHandler.performAction({
            type: 'addLetter',
            letter: 'a',
        });
        expect(state.word).toEqual('ba');
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
        const normalAction2 = optimisticActionHandler.proposeAction(
            action2,
            false
        );
        const optimisticAction3 = optimisticActionHandler.proposeAction(
            action3,
            true
        );
        const normalAction4 = optimisticActionHandler.proposeAction(
            action4,
            false
        );
        expect(state.word).toEqual('a');
        await optimisticAction1;
        expect(state.word).toEqual('');
        optimisticActionHandler.performAction(action1);
        expect(state.word).toEqual('a');
        expectAsync(optimisticAction3).toBePending();
        expectAsync(normalAction4).toBePending();

        await normalAction2;
        optimisticActionHandler.performAction(action2);
        expect(state.word).toEqual('ab');
        expectAsync(normalAction4).toBePending();

        await optimisticAction3;
        optimisticActionHandler.performAction(action3);
        expect(state.word).toEqual('abc');

        await normalAction4;
        optimisticActionHandler.performAction(action4);
        expect(state.word).toEqual('abcd');
    });
});
