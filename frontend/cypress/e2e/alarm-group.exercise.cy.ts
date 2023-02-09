describe('The alarm group overview on the exercise page', () => {
    beforeEach(() => {
        cy.createExercise().joinExerciseAsTrainer();
        cy.get('[data-cy=trainerToolbarCreationButton]').click();
        cy.get('[data-cy=trainerToolbarAlarmGroupsButton]').click();
    });

    it('can create alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[AlarmGroup] Add AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .should('not.be.empty');
    });

    it('can rename alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupRenameInput"]')
            .first()
            .clear()
            .type('ABC123');

        cy.wait(1000);
        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[AlarmGroup] Rename AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .itsValues()
            .firstElement()
            .should('have.property', 'name', 'ABC123');
    });

    it('can remove alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupsRemoveButton"]').first().click();

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[AlarmGroup] Remove AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .should('be.empty');
    });

    it('can add vehicles to alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupAddVehicleButton"]').first().click();
        cy.get('[data-cy="alarmGroupAddVehicleSelect"] > :nth-child(1)')
            .first()
            .click();

        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[AlarmGroup] Add AlarmGroupVehicle'
            );

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .itsValues()
            .firstElement()
            .its('alarmGroupVehicles')
            .should('not.be.empty');
    });

    it('can edit alarm group vehicles', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupAddVehicleButton"]').first().click();
        cy.get('[data-cy="alarmGroupAddVehicleSelect"] > :nth-child(1)')
            .first()
            .click();
        cy.get('[data-cy="alarmGroupVehicleDelayInput"]')
            .first()
            .clear()
            .type('10');

        cy.wait(1000);
        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[AlarmGroup] Edit AlarmGroupVehicle'
            );

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .itsValues()
            .firstElement()
            .its('alarmGroupVehicles')
            .itsValues()
            .firstElement()
            .should('have.property', 'time', 600000);
    });

    it('can remove alarm group vehicles', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupAddVehicleButton"]').first().click();
        cy.get('[data-cy="alarmGroupAddVehicleSelect"] > :nth-child(1)')
            .first()
            .click();
        cy.get('[data-cy="alarmGroupRemoveVehicleButton"]').first().click();

        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[AlarmGroup] Remove AlarmGroupVehicle'
            );

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .itsValues()
            .firstElement()
            .its('alarmGroupVehicles')
            .should('be.empty');
    });
});
