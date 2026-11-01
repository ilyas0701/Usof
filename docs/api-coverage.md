# API Coverage

- React: authentication, profiles, posts, comments, reactions, categories, favorites and subscriptions.
- Admin React pages: user editing/deletion/roles, invitations and category management.
- Invitations use `/api/users/invitations` and `/api/auth/accept-invitation`; direct `POST /api/users` creation remains in API/AdminJS.
- AdminJS manages users, posts, categories, comments and reactions through services.
- AdminJS post/comment editing changes status only. Post categories and locks can be changed through React/API.
- Post image uploads are author-only.
- Global comment/reaction administration is available through AdminJS and admin API routes.

This describes code coverage, not a full browser or SMTP test.
