describe('A trainer on the exercise page', () => {
    beforeEach(() => {
        cy.createExercise().joinExerciseAsTrainer();
    });

    it('can drag features to the map', () => {
        cy.log('drag a patient to the map').dragToMap(
            '[data-cy=draggablePatientDiv]'
        );

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Patient] Add patient');

        cy.getState()
            .its('exerciseState')
            .its('patients')
            .should('not.be.empty');

        cy.log('drag a vehicle to the map').dragToMap(
            '[data-cy=draggableVehicleDiv]'
        );

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Vehicle] Add vehicle');

        cy.getState()
            .its('exerciseState')
            .its('vehicles')
            .should('not.be.empty');

        cy.log('drag a viewport to the map').dragToMap(
            '[data-cy=draggableViewportDiv]'
        );

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Viewport] Add viewport');

        cy.getState()
            .its('exerciseState')
            .its('viewports')
            .should('not.be.empty');

        cy.log('drag a simulated region to the map').dragToMap(
            '[data-cy=draggableSimulatedRegionDiv]'
        );

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

        cy.log('drag a transfer point to the map').dragToMap(
            '[data-cy=draggableTransferPointDiv]'
        );

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

        cy.log('drag a map image to the map').dragToMap(
            '[data-cy=draggableMapImageDiv]'
        );

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[MapImage] Add MapImage');

        cy.getState()
            .its('exerciseState')
            .its('mapImages')
            .should('not.be.empty');
    });

    it('can manage alarm groups', () => {
        cy.get('[data-cy=trainerToolbarCreationButton]').click();
        cy.get('[data-cy=trainerToolbarAlarmGroupsButton]').click();

        cy.log('add an alarm group')
            .get('[data-cy="alarmGroupAddButton"]')
            .click();
        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[AlarmGroup] Add AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .should('not.be.empty');

        cy.log('rename an alarm group')
            .get('[data-cy="alarmGroupRenameInput"]')
            .first()
            .clear()
            .type('ABC123');

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[AlarmGroup] Rename AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .itsValues()
            .firstElement()
            .should('have.property', 'name', 'ABC123');

        cy.log('add an alarm group vehicle')
            .get('[data-cy="alarmGroupAddVehicleButton"]')
            .first()
            .click();
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

        cy.log('change the input delay of a vehicle')
            .get('[data-cy="alarmGroupVehicleDelayInput"]')
            .first()
            .clear()
            .type('10');

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

        cy.get('[data-cy=alarmGroupAddVehicleButton]').first().click();
        cy.get('[data-cy=alarmGroupAddVehicleSelect] > :nth-child(2)')
            .first()
            .click();
        cy.get('[data-cy=alarmGroupClosePopupButton]').click();
        cy.dragToMap('[data-cy=draggableTransferPointDiv]');
        cy.get('[data-cy=trainerToolbarExecutionButton]').click();
        cy.get('[data-cy=trainerToolbarControlCenterButton]').click();
        cy.get('[data-cy=sendAlarmGroupChooseTargetButton]').first().click();
        cy.get('[data-cy=sendAlarmGroupChooseTargetSelect] > :nth-child(1)')
            .first()
            .click();
        cy.get('[data-cy=sendAlarmGroupSendButton]').click();

        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[Emergency Operation Center] Add Log Entry'
            );

        cy.proposedActions()
            .nthLastElement(1)
            .should('have.property', 'type', '[Transfer] Add to transfer');

        cy.proposedActions()
            .nthLastElement(2)
            .should('have.property', 'type', '[Vehicle] Add vehicle');

        cy.proposedActions()
            .nthLastElement(3)
            .should('have.property', 'type', '[Transfer] Add to transfer');

        cy.proposedActions()
            .nthLastElement(4)
            .should('have.property', 'type', '[Vehicle] Add vehicle');

        cy.get('[data-cy=closeEmergencyOperationsCenterPopupButton]').click({
            force: true,
        });
        cy.get('[data-cy=trainerToolbarExecutionButton]').click();
        cy.get('[data-cy=trainerToolbarTransferButton]').click();
        cy.get('[data-cy=transferOverviewLetArriveInstantlyButton]')
            .first()
            .click();

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Transfer] Finish transfer');

        cy.getState()
            .its('exerciseState')
            .its('vehicles')
            .itsValues()
            .firstElement()
            .its('position')
            .should('have.property', 'type', 'coordinates');

        cy.getState()
            .its('exerciseState')
            .its('vehicles')
            .itsValues()
            .nthElement(1)
            .its('position')
            .should('have.property', 'type', 'transfer');

        cy.get('[data-cy=transferOverviewCloseButton]').click({ force: true });
        cy.get('[data-cy=trainerToolbarCreationButton]').click();
        cy.get('[data-cy=trainerToolbarAlarmGroupsButton]').click();

        cy.log('remove an alarm group vehicle')
            .get('[data-cy="alarmGroupRemoveVehicleButton"]')
            .first()
            .click();
        cy.log('remove an alarm group vehicle')
            .get('[data-cy="alarmGroupRemoveVehicleButton"]')
            .first()
            .click();

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

        cy.log('remove an alarm group')
            .get('[data-cy="alarmGroupsRemoveButton"]')
            .first()
            .click();

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[AlarmGroup] Remove AlarmGroup');

        cy.getState()
            .its('exerciseState')
            .its('alarmGroups')
            .should('be.empty');
    });

    it('can manage hospitals', () => {
        cy.get('[data-cy=trainerToolbarCreationButton]').click();
        cy.get('[data-cy=trainerToolbarHospitalsButton]').click();

        cy.log('add a hospital').get('[data-cy="hospitalAddButton"]').click();
        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Hospital] Add hospital');

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .should('not.be.empty');

        cy.log('rename a hospital')
            .get('[data-cy="hospitalRenameInput"]')
            .first()
            .clear()
            .type('ABC123');

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Hospital] Rename hospital');

        cy.getState()
            .its('exerciseState')
            .its('hospitals')
            .itsValues()
            .firstElement()
            .should('have.property', 'name', 'ABC123');

        cy.log('update a hospitals transport time')
            .get('[data-cy="hospitalUpdateTransportTimeInput"]')
            .first()
            .clear()
            .type('30');

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

        // Currently broken because we can't drag and drop on the ol map
        // cy.get('[data-cy=hospitalClosePopupButton').click();

        // cy.log('tranfer patients to a hospital');
        // cy.dragToMap('[data-cy=draggableTransferPointDiv]');
        // cy.get('[data-cy=openLayersContainer]').click();
        // cy.get('[data-cy=transferPointPopupHospitalNav]').click();
        // cy.get('[data-cy=transferPointPopupAddHospitalButton]').click();
        // cy.get('[data-cy=transferPointPopupAddHospitalDropdownButton]')
        //     .first()
        //     .click({ force: true });
        // cy.get('[data-cy=transferPointPopupCloseButton]').click();

        // cy.dragToMap('[data-cy=draggableVehicleDiv]');

        // cy.get('[data-cy=chooseTransferTargetPopupHospitalDropdown]').click();

        // cy.proposedActions();
        // cy.getState()
        //     .its('exerciseState')
        //     .its('vehicles')
        //     .itsValues()
        //     .firstElement()
        //     .its('position')
        //     .should('have.property', 'type', 'transfer');
        // cy.get('[data-cy=trainerToolbarCreationButton]')
        //     .click();
        // cy.get('[data-cy=trainerToolbarHospitalsButton]').click();

        cy.log('delete a hospital');
        cy.get('[data-cy="hospitalDeleteButton"]').click();

        cy.proposedActions()
            .lastElement()
            .should('have.property', 'type', '[Hospital] Remove hospital');

        cy.getState().its('exerciseState').its('hospitals').should('be.empty');
    });

    it('can start and stop an exercise', () => {
        cy.log('start an exercise')
            .get('[data-cy=trainerToolbarStartButton]')
            .click();
        cy.get('[data-cy=confirmationModalOkButton]').click();

        cy.proposedActions()
            .nthLastElement(1)
            .should('have.property', 'type', '[Exercise] Start');

        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[Emergency Operation Center] Add Log Entry'
            );

        cy.wait(1000);
        cy.performedActions()
            .lastElement()
            .should('have.property', 'type', '[Exercise] Tick');

        cy.getState()
            .its('exerciseState')
            .its('currentTime')
            .should('be.greaterThan', 0);

        cy.log('pause an exercise')
            .get('[data-cy=trainerToolbarPauseButton]')
            .click();

        cy.proposedActions()
            .nthLastElement(1)
            .should('have.property', 'type', '[Exercise] Pause');

        cy.proposedActions()
            .lastElement()
            .should(
                'have.property',
                'type',
                '[Emergency Operation Center] Add Log Entry'
            );
    });
});
