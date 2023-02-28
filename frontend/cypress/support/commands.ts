// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import type {
    JsonObject,
    UUID,
    SocketResponse,
    ExerciseAction,
} from 'digital-fuesim-manv-shared';
import { io } from 'socket.io-client';

export function dragToMap(
    elementSelector: string,
    offset?: { x: number; y: number }
) {
    const mapSelector = '[data-cy=openLayersContainer]';

    cy.get(elementSelector).first().trigger('mousedown');

    return (
        cy
            .get(mapSelector)
            /**
             * We have to force the click here, as the img
             * of the element being dragged is in front of the map
             **/
            .trigger('mousemove', { force: true, ...offset })
            .click({ force: true })
    );
}

export function store() {
    return cy.window().its('cypressTestingValues', { log: false }).its('store');
}

export function getState() {
    return cy.wrap(
        new Promise((resolve) => {
            cy.store()
                .invoke({ log: false }, 'select', 'application')
                .invoke({ log: false }, 'subscribe', (state: any) =>
                    resolve(state)
                )
                .log('get state');
        }),
        { log: false }
    );
}

export function createExercise() {
    cy.visit('/');
    cy.window()
        .its('cypressTestingValues', { log: false })
        .its('backendBaseUrl')
        .as('backendBaseUrl');
    cy.window()
        .its('cypressTestingValues', { log: false })
        .its('websocketBaseUrl')
        .as('websocketBaseUrl');

    cy.get('@backendBaseUrl', { log: false }).then((backendBaseUrl) =>
        cy
            .request('POST', `${backendBaseUrl}/api/exercise`)
            .its('body')
            .as('createBody')
    );
    cy.get('@createBody', { log: false }).its('trainerId').as('trainerId');
    cy.get('@createBody', { log: false })
        .its('participantId')
        .as('participantId');
    return cy;
}

export function joinExerciseAsTrainer() {
    cy.get('@trainerId', { log: false }).then((trainerId) =>
        cy.visit(`exercises/${trainerId}`)
    );
    cy.get('[data-cy=joinExerciseModalButton]').click();
    return cy;
}

export function joinExerciseAsParticipant() {
    cy.get('@participantId', { log: false }).then((participantId) =>
        cy.visit(`exercises/${participantId}`)
    );
    cy.get('[data-cy=joinExerciseModalButton]').click();
    return cy;
}

export function initializeParticipantSocket() {
    cy.get('@websocketBaseUrl', { log: false }).then(
        (websocketBaseUrl: any) => {
            cy.wrap(io(websocketBaseUrl, { transports: ['websocket'] })).as(
                'participantSocket'
            );
        }
    );

    cy.get('@participantId', { log: false }).then((participantId: any) => {
        cy.get('@participantSocket', { log: false }).then(
            (participantSocket: any) => {
                cy.wrap(
                    new Promise<SocketResponse<UUID>>((resolve) => {
                        participantSocket.emit(
                            'joinExercise',
                            participantId,
                            '',
                            (response: SocketResponse<UUID>) =>
                                resolve(response)
                        );
                    }),
                    { log: false }
                )
                    .its('payload')
                    .as('participantSocketUUID');
            }
        );
    });

    cy.wrap([])
        .as('participantSocketPerformedActions')
        .then((performedActions: any) => {
            cy.get('@participantSocket', { log: false }).then(
                (participantSocket: any) => {
                    participantSocket.on(
                        'performAction',
                        (action: ExerciseAction) => {
                            performedActions.push(action);
                        }
                    );
                }
            );
        });

    return cy;
}

export function initializeTrainerSocket() {
    cy.get('@websocketBaseUrl', { log: false }).then(
        (websocketBaseUrl: any) => {
            cy.wrap(io(websocketBaseUrl, { transports: ['websocket'] })).as(
                'trainerSocket'
            );
        }
    );

    cy.get('@trainerId', { log: false }).then((trainerId: any) => {
        cy.get('@trainerSocket', { log: false }).then((trainerSocket: any) => {
            cy.wrap(
                new Promise<SocketResponse<UUID>>((resolve) => {
                    trainerSocket.emit(
                        'joinExercise',
                        trainerId,
                        '',
                        (response: SocketResponse<UUID>) => resolve(response)
                    );
                }),
                { log: false }
            )
                .its('payload')
                .as('trainerSocketUUID');
        });
    });

    cy.wrap([])
        .as('trainerSocketPerformedActions')
        .then((performedActions: any) => {
            cy.get('@trainerSocket', { log: false }).then(
                (trainerSocket: any) => {
                    trainerSocket.on(
                        'performAction',
                        (action: ExerciseAction) => {
                            performedActions.push(action);
                        }
                    );
                }
            );
        });

    return cy;
}

export function firstElement(subject: Array<unknown>) {
    return cy.log('first element').wrap(subject.at(0), { log: false });
}

export function lastElement(subject: Array<unknown>) {
    return cy.log('last element').wrap(subject.at(-1), { log: false });
}

export function atPosition(subject: Array<unknown>, n: number) {
    return cy.log(`${n}th element`).wrap(subject.at(n), { log: false });
}

export function atKey(subject: JsonObject, key: string) {
    return cy.log(`atKey ${key}`).wrap(subject[key]);
}

export function itsKeys(subject: JsonObject) {
    return cy.log('its keys').wrap(Object.keys(subject), { log: false });
}

export function itsValues(subject: JsonObject) {
    return cy.log('its values').wrap(Object.values(subject), { log: false });
}
