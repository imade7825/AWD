# IT-Book library

## Introduction

The customer is a library focused on IT books in the fictitious city of Foobar town. The library wants to make its books available online to give customers the possibility to save their favorite books in a list. It is your task to create this app for the customer.

## Given

### Rest-API

The REST-API is available at https://www.npmjs.com/package/bookmonkey-api. Follow the instructions to start the api server on your local machine.

### Templates

The templates for the project are already pre-designed. You'll find them in the `src` directory of this project.

## Todos

### Add a filterable book listing

- [ ] All books of the customer must be presented in a table.
  - The following information of a book should be displayed per row
    - title
    - isbn
    - author
    - publisher
- [ ] Implement a search by title functionality
- [ ] Implement a filter to show only books from a specific publisher

### Add detail page

- [ ] There should exist a detail page for each book. All required information in the template file `src/detail.html` should be displayed on this page.
- [ ] The detail of each book should be accessible from the list view

### Add a favorites list

- [ ] It must be possible to add a book as a favorite in the list view
- [ ] The wishlist should be accessible in the header of the application
  - [ ] The count of favorite books should be displayed in the header
- [ ] The favorites should be permanently saved in the user's client, so that the next time he visits, his saved books will be displayed again.
- It should be possible to remove a favorite

## Technical Requirements

- Avoid to use a component library to solve the problems
- Use typescript
- Project should use create-vue, choose the configuration that fits best for you
