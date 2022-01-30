// TODO: this is just a proof of concept on how to test - they should be replaced with real tests
describe('The landing page', () => {
    beforeEach(() => {
        // TODO: reset the backend database e.g.:
        // `cy.exec('npm run db:reset && npm run db:seed')`
        // or sending a request to the server to reset the database (set to a fixture?)
        // or creating a new exercise
    });

    it('loads the landing page', () => {
        cy.visit('/');
    });

    // TODO: we would have to create a new exercise first https://github.com/hpi-sam/digital-fuesim-manv/issues/24 (use fixtures)
    // it('can join an exercise', () => {
    //     cy.visit('/');
    //     cy.get('.container').should('not.contain', 'Add');
    //     cy.contains('Join').click();
    //     cy.get('.container').should('contain', 'Add');
    // });

    it('can create an exercise', () => {
        cy.visit('/');
        cy.get('#exerciseId').should('have.value', '');
        cy.contains('Create').click();
        cy.get('#exerciseId').should('not.have.value', '');
    });

    it('is possible to make visual regression tests (for e.g. a canvas)', () => {
        cy.visit('/');
        cy.get('#app-container').compareSnapshot('landing-page', 0.1);
    });
});
