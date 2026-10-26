# Investigate

## Frontend and API

The interface uses Fetch API to communicate with the backend. Public requests load questions and categories. Protected requests send an access token in the Authorization header.

React components separate repeated interface elements from pages. Shared components include buttons, form fields, question cards, pagination, and messages.

## Authentication and Navigation

Authentication state is shared through React Context. The application reads the browser location to choose a page. Protected pages open the login form when the user is not signed in.

## Technology Stack

- JavaScript
- React
- HTML and SCSS
- Vite
- Fetch API

## Main Parts

The frontend consists of authentication forms, the question list, question pages, the editor, and profiles. The backend remains responsible for database operations, permissions, and sending emails.
