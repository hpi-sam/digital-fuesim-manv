describe('The alarm group overview on the exercise page', () => {
    beforeEach(() => {
        cy.createExercise().joinExerciseAsTrainer();
        cy.get('[data-cy=trainerToolbarCreationButton]').click();
        cy.get('[data-cy=trainerToolbarAlarmGroupsButton]').click();
    });

    it('can create alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Add AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => Object.keys(alarmGroups))
            .its('length')
            .should('eq', 1);
    });

    it('can rename alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupRenameInput"]')
            .first()
            .clear()
            .type('ABC123');

        cy.wait(1000);
        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Rename AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => alarmGroups[Object.keys(alarmGroups)[0]!])
            .its('name')
            .should('eq', 'ABC123');
    });

    it('can remove alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupsRemoveButton"]').first().click();

        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Remove AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => Object.keys(alarmGroups))
            .its('length')
            .should('eq', 0);
    });

    it('can add vehicles to alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupAddVehicleButton"]').first().click();
        cy.get('[data-cy="alarmGroupAddVehicleSelect"] > :nth-child(1)')
            .first()
            .click();

        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Add AlarmGroupVehicle');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => alarmGroups[Object.keys(alarmGroups)[0]!])
            .its('alarmGroupVehicles')
            .then((alarmGroupVehicles) => Object.keys(alarmGroupVehicles))
            .its('length')
            .should('eq', 1);
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
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Edit AlarmGroupVehicle');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => alarmGroups[Object.keys(alarmGroups)[0]!])
            .its('alarmGroupVehicles')
            .then(
                (alarmGroupVehicles) =>
                    alarmGroupVehicles[Object.keys(alarmGroupVehicles)[0]!]
            )
            .its('time')
            .should('eq', 600000);
    });

    it('can remove alarm group vehicles', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupAddVehicleButton"]').first().click();
        cy.get('[data-cy="alarmGroupAddVehicleSelect"] > :nth-child(1)')
            .first()
            .click();
        cy.get('[data-cy="alarmGroupRemoveVehicleButton"]').first().click();

        cy.proposedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Remove AlarmGroupVehicle');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => alarmGroups[Object.keys(alarmGroups)[0]!])
            .its('alarmGroupVehicles')
            .then((alarmGroupVehicles) => Object.keys(alarmGroupVehicles))
            .its('length')
            .should('eq', 0);
    });
});
