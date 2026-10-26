# Analysis

## Application Architecture

The frontend is separated into pages, reusable components, API modules, shared state, hooks, and utilities.

`App.jsx` selects the page from the browser location. API modules handle requests, while page components load data and display forms and results. React Context provides the current user and authentication actions.

The interface uses the existing backend instead of keeping a separate copy of application data. After a successful action, the page updates its state or loads the changed data again. Request errors are shown as messages.

The backend remains in `API/` and runs separately. Vite forwards frontend requests to it during local development.
