# Act: Basic

## Application Setup

The frontend uses React and Vite. SCSS files define shared colors, fonts, spacing, and component styles. Pages and repeated interface elements are separated into components.

## Authentication and Profiles

The application has registration, email verification, login, logout, and password reset forms. The access token and user data are stored in local storage. Protected requests include the token. An expired token or an unauthorized response clears the session.

Users can view profiles and edit their own login, full name, email, and avatar. My posts loads questions by author and provides date or like sorting, pagination, and a status filter.

## Questions and Comments

The main page loads questions from the API, with recent questions first. Users can filter by category, date interval, and status, or sort by popularity. Lists use pagination.

The question form supports a title, text, categories, active or inactive status, and image uploads. Categories can be created inside the form. Question pages show images, replies, and reactions. Authors can edit, lock, or delete their own content.

Replies can refer to other comments. The interface groups them under their parent and limits visual indentation for deeper threads. Comments at each level are always sorted by ascending like count. Replies stay under their parent.

## Application Flow

1. The application reads the URL and restores a valid local session.
2. The selected page loads its data through an API module. A loading indicator or error message is shown when needed.
3. The API module sends a Fetch request, adding the access token for protected actions.
4. The backend checks the request and returns data or an error.
5. React displays the result. Form submissions update the page state or navigate to the saved record.
6. Navigation updates browser history and starts the new page at the top. Logout removes the local session and calls the logout endpoint.

## Validation and Checks

Forms check required fields, login and email formats, password confirmation, and image limits. The server performs its own validation and permission checks. Build and lint commands are available at the repository root. Tests cover comment nesting and question status permissions.
