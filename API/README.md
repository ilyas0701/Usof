# USOF Backend

USOF is a question-and-answer service for developers. This repository contains its API, MySQL database setup, and an admin panel. Users can publish posts, comment, react with likes or dislikes, and build a rating. The project uses JavaScript, Node.js, Express, MySQL, and AdminJS.

## Requirements and setup

Install Node.js 22 or newer, npm, and MySQL. An SMTP account is needed for registration and password reset emails. Copy `.env.example` to `.env` and set the database, SMTP, URL, and secret values. `APP_URL` should point to this server, for example `http://localhost:3000`. `FRONTEND_URL` is used in email verification and password reset links. The MySQL account must be able to create the database on the first run.

```bash
npm install
npm run db:setup
npm start
```

`db:setup` creates the database tables and adds seed data. Later starts run the migrations automatically and do not erase existing data. To run only migrations, use `npm run db:migrate`. The API runs on the port from `.env`, or on port 3000 by default.

## Using the API

Public routes include `GET /api/posts`, `GET /api/posts/:id`, and the category routes. Registration and login are available at `/api/auth/register` and `/api/auth/login`. Protected API requests use the login token in the `Authorization: Bearer <token>` header. An email must be verified before the user can log in. The API also supports password reset by email.

Users can create posts, add comments and likes, upload avatars and post images, and manage their own content. Posts can be sorted by likes or date and filtered by category, date interval, and status. A signed-in user can save a post with `POST /api/posts/:id/favorite`, view saved posts with `GET /api/posts/favorites`, and remove one with `DELETE /api/posts/:id/favorite`. The saved list is private and supports `page` and `pageSize`. Likes and dislikes change the author's rating automatically. Locked posts and comments cannot receive new activity from regular users. The API logout endpoint responds successfully; the client must remove its access token.

Search posts with `GET /api/posts/search?q=word`. It checks titles and content without case sensitivity, puts title matches first, and supports the existing pagination and filters. `GET /api/posts?q=word` also works. Search follows the same rules for active and inactive posts as the normal post list.

Users can also follow posts with `POST /api/posts/:id/subscribe`, see followed posts at `GET /api/posts/subscriptions`, and stop following with `DELETE /api/posts/:id/subscribe`. When a post is updated, receives images or a comment, or is deleted, the server emails its subscribers at their verified addresses. A subscriber also receives an email for their own action. Email delivery needs working SMTP settings; failed deliveries are logged and do not undo the post action. The API does not keep a notification inbox or retry failed emails.

The AdminJS panel is available at `/admin`. Only a verified user with the `admin` role can sign in. Admins can manage users, posts, categories, comments, and likes. New users start with the `user` role; an admin can change the role afterward. In the panel, editing an existing post or comment changes only its status, while deletion remains available. A new post still needs at least one category ID.

The interactive API reference is available at `/api/docs`, and its OpenAPI file is at `/api/openapi.json`. Open the reference to see request bodies and responses and to send requests from the browser. Log in first, then enter the returned token in the Bearer authentication field for protected routes. The Scalar page loads its JavaScript from a CDN, so the browser needs an internet connection to display it.

## Project structure

`routes/` defines the API paths, `controllers/` handles requests, `services/` contains business rules, and `models/` runs database queries. `middleware/` checks authentication, roles, and uploaded files. `database/migrations/` defines the schema, `database/seeds/` contains example data, and `admin/` connects AdminJS to the application. Uploaded files are stored locally in `uploads/`.

The development notes are in [docs/](docs/basic.md), and the Scalar addition is described in [Act: Creative](docs/creative.md). The database diagram is shown below.

![Database diagram](docs/img/db-diagram.jpg)
