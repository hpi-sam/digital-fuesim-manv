describe('The trainer map editor on the exercise page', () => {
    beforeEach(() => {
        cy.createExercise().joinExerciseAsTrainer();
    });

    afterEach(() => cy.deleteExercise())

    it('can drag patients to the map', () => {
        cy.dragToMap('[data-cy=getPatientDiv]');

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[Patient] Add patient');

        cy.storeState()
            .its('exerciseState')
            .its('patients')
            .then((patients) => Object.keys(patients))
            .its('length')
            .should('eq', 1);
    });

    it('can drag vehicles to the map', () => {
        cy.dragToMap('[data-cy=getVehicleDiv]');

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[Vehicle] Add vehicle');

        cy.storeState()
            .its('exerciseState')
            .its('vehicles')
            .then((vehicles) => Object.keys(vehicles))
            .its('length')
            .should('eq', 1);
    });

    it('can drag viewports to the map', () => {
        cy.dragToMap('[data-cy=getViewportDiv]');

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[Viewport] Add viewport');

        cy.storeState()
            .its('exerciseState')
            .its('viewports')
            .then((viewports) => Object.keys(viewports))
            .its('length')
            .should('eq', 1);
    });

    it('can drag simulated regions to the map', () => {
        cy.dragToMap('[data-cy=getSimulatedRegionDiv]');

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[SimulatedRegion] Add simulated region');

        cy.storeState()
            .its('exerciseState')
            .its('simulatedRegions')
            .then((simulatedRegions) => Object.keys(simulatedRegions))
            .its('length')
            .should('eq', 1);
    });

    it('can drag transfer points to the map', () => {
        cy.dragToMap('[data-cy=getTransferPointDiv]');

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[TransferPoint] Add TransferPoint');

        cy.storeState()
            .its('exerciseState')
            .its('transferPoints')
            .then((transferPoints) => Object.keys(transferPoints))
            .its('length')
            .should('eq', 1);
    });

    it('can drag map images to the map', () => {
        cy.dragToMap('[data-cy=getMapImageDiv]');

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[MapImage] Add MapImage');

        cy.storeState()
            .its('exerciseState')
            .its('mapImages')
            .then((mapImages) => Object.keys(mapImages))
            .its('length')
            .should('eq', 1);
    });
});
