/* eslint-disable @typescript-eslint/method-signature-style */
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// When a command from ./commands is ready to use, import with `import './commands'` syntax

import {
    dragToMap,
    storeState,
    socket,
    performedActions,
    registerSocketListener,
    createExercise,
    joinExerciseAsTrainer,
    joinExerciseAsParticipant,
    deleteExercise,
} from './commands';

declare global {
    namespace Cypress {
        interface Chainable {
            dragToMap(
                elementSelector: string,
                offset?: { x: number; y: number }
            ): Chainable;
            storeState(): Chainable;
            socket(): Chainable;
            registerSocketListener(): Chainable;
            performedActions(): Chainable;
            createExercise(): Chainable,
            deleteExercise(): Chainable,
            joinExerciseAsTrainer(): Chainable,
            joinExerciseAsParticipant(): Chainable,
        }
    }
}

Cypress.Commands.add('dragToMap', dragToMap);
Cypress.Commands.add('storeState', storeState);
Cypress.Commands.add('socket', socket);
Cypress.Commands.add('registerSocketListener', registerSocketListener);
Cypress.Commands.add('performedActions', performedActions);
Cypress.Commands.add('createExercise', createExercise)
Cypress.Commands.add('deleteExercise', deleteExercise)
Cypress.Commands.add('joinExerciseAsTrainer', joinExerciseAsTrainer)
Cypress.Commands.add('joinExerciseAsParticipant', joinExerciseAsParticipant)
