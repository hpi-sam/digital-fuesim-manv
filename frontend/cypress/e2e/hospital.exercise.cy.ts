describe('The hospital overview on the exercise page', () => {
    beforeEach(() => {
        cy.createExercise().joinExerciseAsTrainer();
        cy.get('[data-cy=trainerToolbarCreationButton]').click();
        cy.get('[data-cy=trainerToolbarHospitalsButton]').click();
    });

    it('can create hospitals', () => {
        cy.get('[data-cy="hospitalAddButton"]').click();
        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[Hospital] Add hospital');

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .then((hospitals) => Object.keys(hospitals))
            .its('length')
            .should('eq', 1);
    });

    it('can update a hospitals name', () => {
        cy.get('[data-cy="hospitalAddButton"]').click();
        cy.get('[data-cy="hospitalRenameInput"]')
            .first()
            .clear()
            .type('ABC123');

        cy.wait(1000);
        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[Hospital] Rename hospital');

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .then((hospitals) => Object.values(hospitals)[0])
            .its('name')
            .should('eq', 'ABC123');
    });

    it('can update a hospitals transport time', () => {
        cy.get('[data-cy="hospitalAddButton"]').click();
        cy.get('[data-cy="hospitalUpdateTransportTimeInput"]')
            .first()
            .clear()
            .type('30');

        cy.wait(1000);
        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[Hospital] Edit transportDuration to hospital');

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .then((hospitals) => Object.values(hospitals)[0])
            .its('transportDuration')
            .should('eq', 1800000);
    });

    it('can delete hospitals', () => {
        cy.get('[data-cy="hospitalAddButton"]').click();
        cy.get('[data-cy="hospitalDeleteButton"]').click();

        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[Hospital] Remove hospital');

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .then((hospitals) => Object.keys(hospitals))
            .its('length')
            .should('eq', 0);
    });
});
