describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
    cy.login('test', '', true)
    cy.get('.error-snackbar-row .error-title').contains('Пользователь не найден !')
    cy.login('masackre77@yandex.ru', '1')
  })
})
