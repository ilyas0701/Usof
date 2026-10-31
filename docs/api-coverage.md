# API Coverage

This is a code review of the current routes, React request modules, page controls, and AdminJS handlers. It does not confirm every action against a running database or SMTP server. AdminJS calls backend services directly; those actions are functional equivalents, not React calls to the REST endpoints.

## Remaining Gaps

- An admin can change post categories and lock state through the API, but the current panel edits only post status. React owner controls are hidden on other authors' posts.
- Comment content cannot be edited by any role. Only the comment author or an admin can change comment status through the API and React controls. Lock and delete controls are available to the author or an admin; the panel edits only comment status.
- An admin can upload images to another author's post through the API, but the upload form is shown only to the author and no equivalent AdminJS upload exists.
- Administrative REST routes for users, categories, and global comment/reaction management have AdminJS equivalents, but are not integrated into React. If assessment requires actual REST calls from the React frontend, these controls still need implementation.
