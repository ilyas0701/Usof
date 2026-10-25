# Investigate
## API

The application needs an API that will allow different client applications to interact with the backend.

The API will be responsible for operations related to:

- users;
- authentication;
- posts;
- categories;
- comments;
- likes and dislikes.

## Database

The application requires storage for users, posts, comments, categories and likes.

According to the project requirements, MySQL will be used as the relational database.

Relationships between these entities will be required. For example, users can create posts and comments, while posts can be associated with multiple categories.

## Admin Panel

An admin panel is required to manage application data.

Only users with admin role should have access to it.

Admins should be able to manage:

- users;
- posts;
- categories;
- comments;
- likes.

AdminJS was chosen as the open-source admin panel. It works with Express, and a Sequelize adapter connects its resources to the existing MySQL tables. Changes made in the panel use the application services, so the same validation and business rules are applied.

## Authentication and Authorization

The application requires authentication to identify users.

Authorization will be used to restrict access to functionality depending on the user's role.

The application will have at least two roles:

- user
- admin

Regular users will have access to standard application functionality, while administrators will have additional permissions for managing.

## Technology Stack

The required technology stack is:

Technology:

- JavaScript
- Node.js
- Express
- MySQL

## Project Planning

The implementation will be divided into smaller parts:

1. Application setup
2. Database
3. Models + Authentication and authorization
4. Users
5. Posts
6. Categories
7. Comments
8. Likes and dislikes
9. Admin panel
10. Validation, error handling, testing

Documentation will be maintained throughout the entire challenge to record development progress.
