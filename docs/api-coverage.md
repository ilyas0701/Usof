# API Coverage

This is a code review of the current routes, React request modules, page controls, and AdminJS handlers. It does not confirm every action against a running database or SMTP server. AdminJS calls backend services directly; those actions are functional equivalents, not React calls to the REST endpoints.

## Remaining Gaps

- An admin can change post categories and lock state through the API, but the current panel edits only post status. React owner controls are hidden on other authors' posts.
- An admin can edit comment content and lock state through the API, but the panel edits only comment status. React edit and delete controls are shown only to the comment author; admin deletion is available in the panel.
- An admin can upload images to another author's post through the API, but the upload form is shown only to the author and no equivalent AdminJS upload exists.
- Administrative REST routes for users, categories, and global comment/reaction management have AdminJS equivalents, but are not integrated into React. If assessment requires actual REST calls from the React frontend, these controls still need implementation.
