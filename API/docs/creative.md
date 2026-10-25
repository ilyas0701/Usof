# Act: Creative

## Interactive API reference

I added a Scalar page at `/api/docs` to make the API easier to explore and use. It reads the OpenAPI description from `/api/openapi.json` and shows the available routes, parameters, request bodies, and responses. A user can log in, enter the Bearer token, and try protected requests on the same server. The reference includes the authentication, users, posts, categories, comments, and admin API routes. Scalar loads in the browser from a CDN, so the browser needs an internet connection.

## Favorite posts

I added a personal Favorites list for each user. A signed-in user can save a post with `POST /api/posts/:id/favorite` and remove it with `DELETE /api/posts/:id/favorite`. `GET /api/posts/favorites` returns saved posts, with the newest saves first and pagination for a long list. This is not a public post category: one user's favorites do not change another user's categories or saved posts. An inactive post is hidden from the list unless the user is its author or an admin. Favorites are removed automatically when a user or post is deleted.

## Post subscriptions and notifications

A signed-in user can follow a post with `POST /api/posts/:id/subscribe`, see followed posts at `GET /api/posts/subscriptions`, and stop following with `DELETE /api/posts/:id/subscribe`. When the post is edited, receives images or a comment, or is deleted, the server sends an email to its subscribers. It uses their verified email addresses. A user who follows their own post also receives these emails. The message has the post title and a link while the post exists. There is no notification table or inbox endpoint. If the mail server fails, the post action still succeeds, but the email is not retried.

## Post search

I added `GET /api/posts/search?q=word` to find posts by words in their titles or content. Search is not case-sensitive, and title matches are shown before content-only matches. It supports pagination and the same category, date, and status filters as the post list. A user can also add `q` to `GET /api/posts`. Public visitors see only active posts, while the existing author and admin rules still apply to inactive posts.
