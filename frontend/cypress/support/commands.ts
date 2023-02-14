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

import type { JsonObject } from 'digital-fuesim-manv-shared';

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

export function performedActions() {
    return cy
        .window()
        .its('cypressTestingValues', { log: false })
        .its('performedActions');
}

export function proposedActions() {
    return cy
        .window()
        .its('cypressTestingValues', { log: false })
        .its('proposedActions');
}

export function createExercise() {
    cy.visit('/');
    cy.window()
        .its('cypressTestingValues', { log: false })
        .its('backendBaseUrl')
        .as('backendBaseUrl');

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

export function firstElement(subject: Array<unknown>) {
    return cy.log('first element').wrap(subject.at(0), { log: false });
}

export function lastElement(subject: Array<unknown>) {
    return cy.log('last element').wrap(subject.at(-1), { log: false });
}

export function nthElement(subject: Array<unknown>, n: number) {
    return cy.log(`${n}th element`).wrap(subject.at(n), { log: false });
}

export function nthLastElement(subject: Array<unknown>, n: number) {
    return cy
        .log(`${n}th last element`)
        .wrap(subject.at(subject.length - (n + 1)), { log: false });
}

export function itsKeys(subject: JsonObject) {
    return cy.log('its keys').wrap(Object.keys(subject), { log: false });
}

export function itsValues(subject: JsonObject) {
    return cy.log('its values').wrap(Object.values(subject), { log: false });
}
