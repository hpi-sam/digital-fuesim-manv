describe('The trainer map editor on the exercise page', () => {
    beforeEach(() => {
        cy.createExercise().joinExerciseAsTrainer();
    });

    it('can drag patients to the map', () => {
        cy.dragToMap('[data-cy=draggablePatientDiv]');

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Patient] Add patient');

        cy.getState()
            .its('exerciseState')
            .its('patients')
            .should('not.be.empty');
    });

    it('can drag vehicles to the map', () => {
        cy.dragToMap('[data-cy=draggableVehicleDiv]');

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Vehicle] Add vehicle');

        cy.getState()
            .its('exerciseState')
            .its('vehicles')
            .should('not.be.empty');
    });

    it('can drag viewports to the map', () => {
        cy.dragToMap('[data-cy=draggableViewportDiv]');

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Viewport] Add viewport');

        cy.getState()
            .its('exerciseState')
            .its('viewports')
            .should('not.be.empty');
    });

    it('can drag simulated regions to the map', () => {
        cy.dragToMap('[data-cy=draggableSimulatedRegionDiv]');

        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[SimulatedRegion] Add simulated region'
            );

        cy.getState()
            .its('exerciseState')
            .its('simulatedRegions')
            .should('not.be.empty');
    });

    it('can drag transfer points to the map', () => {
        cy.dragToMap('[data-cy=draggableTransferPointDiv]');

        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[TransferPoint] Add TransferPoint'
            );

        cy.getState()
            .its('exerciseState')
            .its('transferPoints')
            .should('not.be.empty');
    });

    it('can drag map images to the map', () => {
        cy.dragToMap('[data-cy=draggableMapImageDiv]');

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[MapImage] Add MapImage');

        cy.getState()
            .its('exerciseState')
            .its('mapImages')
            .should('not.be.empty');
    });
});
