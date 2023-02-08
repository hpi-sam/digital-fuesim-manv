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

export function dragToMap(
    elementSelector: string,
    offset?: { x: number; y: number }
) {
    cy.log(`dragging ${elementSelector} to the map`);
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

export function storeState() {
    return cy
        .window()
        .its('cypressTestingValues')
        .its('store')
        .then((store: any) => store.source._value.application);
}

export function performedActions() {
    return cy.window().its('cypressTestingValues').its('performedActions');
}

export function proposedActions() {
    return cy.window().its('cypressTestingValues').its('proposedActions');
}

export function createExercise() {
    cy.visit('/');
    cy.window()
        .its('cypressTestingValues')
        .its('backendBaseUrl')
        .as('backendBaseUrl');

    cy.get('@backendBaseUrl').then((backendBaseUrl) =>
        cy
            .request('POST', `${backendBaseUrl}/api/exercise`)
            .its('body')
            .as('createBody')
    );
    cy.get('@createBody').its('trainerId').as('trainerId');
    cy.get('@createBody').its('participantId').as('participantId');
    return cy;
}

export function joinExerciseAsTrainer() {
    cy.get('@trainerId').then((trainerId) =>
        cy.visit(`exercises/${trainerId}`)
    );
    cy.get('[data-cy=joinExerciseModalButton]').click();
    return cy;
}

export function joinExerciseAsParticipant() {
    cy.get('@participantId').then((participantId) =>
        cy.visit(`exercises/${participantId}`)
    );
    cy.get('[data-cy=joinExerciseModalButton]').click();
    return cy;
}
