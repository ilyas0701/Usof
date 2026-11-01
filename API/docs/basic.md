# Act: Basic

## Architecture

Express routes → middleware → controllers → services → models → MySQL. Services validate input and permissions. Controllers return JSON or HTTP errors.

## Database

Migrations run on startup; completed migrations are recorded. Seeds provide example data and can be rerun without duplicates. Files are stored in `uploads/`.

![Database](img/db-diagram.jpg)

The original diagram does not include later additions: favorites, subscriptions and invitations.

## Authentication

Passwords use bcrypt. JWT protects API requests. Login requires verified email; middleware reads the current role from the database. Email changes require verification again. Logout does not revoke JWTs.

![Authentication sequence](img/sequence-diagram.jpg)

## Invitations

Admins choose email and role. A random token is emailed; its SHA-256 hash and expiry are stored in DbUserInvitation. Acceptance creates a verified user and consumes invitations for that email in one transaction. Failed email delivery removes the new invitation. Expired records remain until deleted.

## Content and roles

- Public posts: active only. Authors can view their own inactive posts; admins can view all.
- Posts support multiple categories, images, search, sorting, filters and pagination.
- Only authors upload post images. Authors and admins can delete posts; admins can moderate status and categories.
- Comment text is immutable. Authors and admins manage comment status, locks and deletion.
- Locked posts/comments reject replies and reactions from regular users.
- One reaction per user and target; likes/dislikes determine author rating.
- Only admins manage categories and user roles.

## AdminJS

Verified admins access `/admin`. The panel manages users, posts, categories, comments and reactions. Existing post/comment edits change status only.
