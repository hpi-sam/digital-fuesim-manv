describe('The hospital overview on the exercise page', () => {
    beforeEach(() => {
        cy.createExercise().joinExerciseAsTrainer();
        cy.get('[data-cy=trainerToolbarCreationButton]').click();
        cy.get('[data-cy=trainerToolbarHospitalsButton]').click();
    });

    it('can create hospitals', () => {
        cy.get('[data-cy="hospitalAddButton"]').click();
        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Hospital] Add hospital');

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .should('not.be.empty');
    });

    it('can update a hospitals name', () => {
        cy.get('[data-cy="hospitalAddButton"]').click();
        cy.get('[data-cy="hospitalRenameInput"]')
            .first()
            .clear()
            .type('ABC123');

        cy.wait(1000);
        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Hospital] Rename hospital');

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .itsValues()
            .firstElement()
            .should('have.property', 'name', 'ABC123');
    });

    it('can update a hospitals transport time', () => {
        cy.get('[data-cy="hospitalAddButton"]').click();
        cy.get('[data-cy="hospitalUpdateTransportTimeInput"]')
            .first()
            .clear()
            .type('30');

        cy.wait(1000);
        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[Hospital] Edit transportDuration to hospital'
            );

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .itsValues()
            .firstElement()
            .should('have.property', 'transportDuration', 1800000);
    });

    it('can delete hospitals', () => {
        cy.get('[data-cy="hospitalAddButton"]').click();
        cy.get('[data-cy="hospitalDeleteButton"]').click();

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Hospital] Remove hospital');

        cy.getState().its('exerciseState').its('hospitals').should('be.empty');
    });
});
