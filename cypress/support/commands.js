// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email = 'test', password = 'test', skipCheck = false) => {
  cy.visit('http://localhost:8080/login')
  cy.get('#login').clear().invoke('val', '')
  cy.get('#login').type(email)
  cy.get('#password').clear().invoke('val', '')

  if (password) {
    cy.get('#password').type(password)
  }

  cy.get('#login_submit').click()
  if (!skipCheck) {
    cy.wait(3000)
    cy.get('.top_search')
      .then(() => {
        if (cy.$$('.modal__title').length) {
          cy.get('.modal__close').click()
        }
      })
  }
})
