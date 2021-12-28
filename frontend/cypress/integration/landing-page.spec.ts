describe('The landing page', () => {
    beforeEach(() => {
        // TODO: reset the backend database e.g. `cy.exec('npm run db:reset && npm run db:seed')`
    });

    after(() => {
        // reset the state of the backend database
    });

    it('loads the landing page', () => {
        cy.visit('/');
        cy.get('.container').should('contain', 'Join');
    });

    it('can join an exercise', () => {
        cy.visit('/');
        cy.get('.container').should('not.contain', 'Add');
        cy.contains('Join').click();
        cy.get('.container').should('contain', 'Add');
    });
    it('can add new patients', () => {
        cy.visit('/');
        cy.contains('Join').click();
        cy.get('.container').should('contain', '0');
        cy.contains('Add').click();
        cy.get('.container').should('contain', '1');
        cy.contains('Add').click();
        cy.get('.container').should('contain', '2');
    });
});
