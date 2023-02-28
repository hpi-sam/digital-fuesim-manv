describe('The landing page', () => {
    it('loads the landing page', () => {
        cy.visit('/');
    });

    it('can create an exercise', () => {
        cy.visit('/');
        cy.get('[data-cy=exerciseIdInput]').should('have.value', '');
        cy.get('[data-cy=createExerciseButton]').click();
        cy.get('[data-cy=exerciseIdInput]').should('not.have.value', '');
    });
});
