# Gender Healthcare Frontend

React 18 + Vite client for the Gender Healthcare modular monolith.

## Architecture

The frontend uses a feature-based structure:

```text
src/
├── app/             # router and application providers
├── features/        # auth, catalog, appointments, medical, blog, chat, etc.
├── pages/           # route-level composition only
├── shared/
│   ├── api/         # Axios clients and response/error normalization
│   ├── auth/        # protected route and session rules
│   ├── components/  # reusable loading/empty/error states
│   ├── constants/   # routes, storage keys and user-facing messages
│   ├── layouts/
│   └── storage/     # token and session persistence
└── redux/           # existing application state
```

Feature API modules own endpoint paths and request mapping. Screens do not create Axios clients or read authentication tokens directly. Legacy files under `src/api` are compatibility re-exports and should not receive new logic.

## Local setup

Requirements: Node.js 18+ and the backend running on port `8085` by default.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Configure `.env` for another backend or OAuth client:

```text
VITE_API_BASE_URL=http://localhost:8085/api
VITE_WEBSOCKET_URL=http://localhost:8085/ws/chat
VITE_GOOGLE_CLIENT_ID=
```

Only `VITE_*` values are available to browser code. Never put private provider credentials in this file.

## Verification

```powershell
npm run lint
npm run build
```

Use the shared manual flow checklist in [`plans/gender-healthcare-refactor/docs/verification/smoke-checklist.md`](../plans/gender-healthcare-refactor/docs/verification/smoke-checklist.md) for public pages, authentication, booking, medical results, blog, chat, payment and role dashboards.

## Deployment

The static build is served by Nginx. Prepare the server with the template at `deploy/nginx.conf`, then deploy with:

```bash
export DEPLOY_HOST=your-server.example
export DEPLOY_USER=deploy
./deploy/frontend-deploy.sh
```

The script creates a timestamped release, updates the `current` symlink, validates Nginx, reloads it, checks the served HTML and rolls back on failure. See [`plans/gender-healthcare-refactor/docs/deployment/runbook.md`](../plans/gender-healthcare-refactor/docs/deployment/runbook.md).
