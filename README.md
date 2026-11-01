# USOF

Q&A platform for developers: posts with images, nested comments, reactions, search, filters, favorites and email subscriptions. Includes email verification, admin moderation and email invitations.

**Stack:** React, Redux Toolkit, RTK Query, SCSS, Node.js, Express, MySQL, AdminJS.

## Run

Requires Node.js 22.12+, MySQL and SMTP credentials.

1. Install dependencies:
   ```bash
   npm install
   npm --prefix API install
   ```
2. Copy `API/.env.example` to `API/.env`. Configure database, SMTP, JWT and password-reset settings. Set `PORT=8888`, `APP_URL=http://localhost:8888`, `FRONTEND_URL=http://localhost:5173`.
3. Prepare the database and start the backend:
   ```bash
   npm --prefix API run db:setup
   npm --prefix API start
   ```
4. Start the frontend in another terminal:
   ```bash
   npm run dev
   ```

Frontend: [localhost:5173](http://localhost:5173). AdminJS: [localhost:8888/admin](http://localhost:8888/admin), admin account required.

## Checks

```bash
npm run build
```

## Details

- `src/` — interface; `src/store/` — Redux state and request cache; `API/` — backend.
- [Backend setup](API/README.md)
- [Frontend notes](docs/basic.md)
- [API coverage](docs/api-coverage.md)
