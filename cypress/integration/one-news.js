describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
    // cy.visit('http://localhost:8080')
    // cy.login('masackre77@yandex.ru', '1')
    cy.get('.menu_item_link[href="/news"]').click()
    cy.get('.breadcrumbs .basic-title').contains('Новости')
    cy.get('.news_item').first()
      .then($card => {
        const title = $card.find('h2 a').text()
        cy.get('.news_item').first().click()
        cy.get('.item_content h2 span').contains(title.trim())
      })
  })
})
