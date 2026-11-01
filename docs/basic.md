# Act: Basic

## Structure

React + Vite + SCSS. Redux stores the session and main-page filters; RTK Query caches API data. Form fields and dialog state stay local.

## Features

- Registration, email verification, login, logout and password reset.
- Profiles: login, name, email and avatar editing.
- My posts: sorting, pagination and searchable category buttons.
- Main page: recent posts, category/date/status filters and sorting.
- Desktop filters stay on the right while scrolling; mobile uses a drawer.
- Posts support multiple categories and images.
- Nested comments stay under their parent and sort by ascending like count within each level.
- Comment text cannot be edited. Status, lock and deletion are available to the author or admin.
- Manage users: editing, role changes, deletion and an invitation dialog.
- Invitations collect email and role; recipients choose login/password and sign in automatically. Links are single-use and expire after 24 hours.

## Flow

URL → page → API module → backend → RTK Query cache → interface. Shared credential validation is used by registration and invitation acceptance.

## Checks

```bash
npm run build
```
