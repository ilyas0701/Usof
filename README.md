# USOF Frontend

USOF is a question-and-answer service for developers. This repository contains a React frontend and the backend in `API/`. Users can publish questions, choose categories, add images, write replies, and react with likes or dislikes.

## Requirements and setup

Install Node.js 22.12 or newer, npm, and MySQL. An SMTP account is needed for verification, password reset, and subscription emails.

Clone the repository and open its directory. Install both parts:

```bash
npm install
cd API
npm install
```

Copy `API/.env.example` to `API/.env` and fill in the database, SMTP, and token settings. For a local setup, use `PORT=3000`, `APP_URL=http://localhost:3000`, and `FRONTEND_URL=http://localhost:5173`. Set `JWT_SECRET`, `JWT_EXPIRES_IN`, `PASSWORD_RESET_SECRET`, and `PASSWORD_RESET_EXPIRES_IN`. The MySQL account needs permission to create the database on the first setup.

From `API/`, prepare the database and start the server:

```bash
npm run db:setup
npm start
```

In another terminal, run the frontend from the repository root:

```bash
npm run dev
```

Open the address printed by Vite, normally `http://localhost:5173`. Vite forwards `/api`, `/uploads`, and `/admin` to the backend using `APP_URL` or `PORT` from `API/.env`. Restart Vite after changing these settings. Keep both servers running.

## Using the application

The main page shows recent questions. Filters select categories, publication dates, status, and sorting. The header search shows matching questions and can open the full result list.

Register and verify your email before logging in. A signed-in user can create questions, upload images, create categories inside the question form, and edit their profile and avatar. My posts shows the user's questions with sorting, pagination, and active or inactive status filters. Inactive questions are visible to their author and administrators.

Question pages contain replies, nested answers, reactions, favorites, and email subscriptions. Authors can edit, lock, or delete their own content. The side menu opens the available sections and contains Log out. Clicking the avatar opens the profile.

Administrators can open `/admin` from the menu and sign in with their verified email and password. The panel manages users, roles, categories, posts, comments, and reactions. Its current limitations are recorded in [API coverage](docs/api-coverage.md).

## Screenshots

Question page:

![Question page](docs/img/question.png)

Filters:

![Filters](docs/img/filters.png)

## Project structure and checks

`src/pages/` contains pages, `src/components/` contains interface components, and `src/api/` contains API requests. Authentication state is stored in `src/context/`. Shared hooks, navigation, and formatting are in `src/hooks/` and `src/utils/`. Styles use SCSS. The backend has its own [README](API/README.md).

```bash
npm run build
npm run lint
node --test src/utils/commentThreads.test.js
node --test API/tests/post-status.test.js
```

`npm run preview` serves the built frontend locally; the API must still be running. Development notes: [Engage](docs/engage.md), [Investigate](docs/investigate.md), [Analysis](docs/analysis.md), [Act: Basic and application flow](docs/basic.md), and [Act: Creative](docs/creative.md).
