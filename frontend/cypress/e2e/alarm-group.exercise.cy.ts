describe('The alarm group overview on the exercise page', () => {
    beforeEach(() => {
        cy.createExercise().joinExerciseAsTrainer();
        cy.get('[data-cy=trainerToolbarCreationButton]').click();
        cy.get('[data-cy=trainerToolbarAlarmGroupsButton]').click();
    });

    afterEach(() => cy.deleteExercise())

    it('can create alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Add AlarmGroup');

        cy.storeState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => Object.keys(alarmGroups))
            .its('length')
            .should('eq', 1);
    });

    it('can rename alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupRenameInput"]').clear().type('ABC123')

        cy.wait(1000)
        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Rename AlarmGroup');

        cy.storeState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => alarmGroups[Object.keys(alarmGroups)[0]!])
            .its('name')
            .should('eq', 'ABC123')
    })

    it('can remove alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupsRemoveButton"]').click();

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Remove AlarmGroup');

        cy.storeState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => Object.keys(alarmGroups))
            .its('length')
            .should('eq', 0)
    })

    it('can add vehicles to alarm groups', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupAddVehicleButton"]').click();
        cy.get(
            '[data-cy="alarmGroupAddVehicleSelect"] > :nth-child(1)'
        ).click();

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Add AlarmGroupVehicle');

        cy.storeState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => alarmGroups[Object.keys(alarmGroups)[0]!])
            .its('alarmGroupVehicles')
            .then(alarmGroupVehicles => Object.keys(alarmGroupVehicles))
            .its('length')
            .should('eq', 1);
    })

    it('can edit alarm group vehicles', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupAddVehicleButton"]').click();
        cy.get(
            '[data-cy="alarmGroupAddVehicleSelect"] > :nth-child(1)'
        ).click();
        cy.get('[data-cy="alarmGroupVehicleDelayInput"]').clear().type('10');

        cy.wait(1000)
        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Edit AlarmGroupVehicle');

        cy.storeState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => alarmGroups[Object.keys(alarmGroups)[0]!])
            .its('alarmGroupVehicles')
            .then(alarmGroupVehicles => alarmGroupVehicles[Object.keys(alarmGroupVehicles)[0]!])
            .its('time')
            .should('eq', 600000);
    })

    it('can remove alarm group vehicles', () => {
        cy.get('[data-cy="alarmGroupAddButton"]').click();
        cy.get('[data-cy="alarmGroupAddVehicleButton"]').click();
        cy.get(
            '[data-cy="alarmGroupAddVehicleSelect"] > :nth-child(1)'
        ).click();
        cy.get('[data-cy="alarmGroupRemoveVehicleButton"]').click();

        cy.performedActions()
            .then((a) => a.at(-1))
            .its('type')
            .should('eq', '[AlarmGroup] Remove AlarmGroupVehicle');

        cy.storeState()
            .its('exerciseState')
            .its('alarmGroups')
            .then((alarmGroups) => alarmGroups[Object.keys(alarmGroups)[0]!])
            .its('alarmGroupVehicles')
            .then(alarmGroupVehicles => Object.keys(alarmGroupVehicles))
            .its('length')
            .should('eq', 0);
    })
});
