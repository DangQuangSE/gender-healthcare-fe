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

Requirements: Node.js 18+ and the backend available through the local runtime configuration.

```powershell
npm install
npm run dev
```

Provide browser-safe runtime configuration through your local development tooling before starting the application.

## Verification

```powershell
npm test
npm run lint
npm run build
```

Use the shared manual flow checklist in [`plans/gender-healthcare-refactor/docs/verification/smoke-checklist.md`](../plans/gender-healthcare-refactor/docs/verification/smoke-checklist.md) for public pages, authentication, booking, medical results, blog, chat, payment and role dashboards.

## Deployment

The production frontend is deployed by Vercel from the `main` branch. The
repository workflow [`.github/workflows/build.yml`](.github/workflows/build.yml)
builds the Vite bundle and verifies `dist/index.html`; Vercel performs the
production deployment after the branch is updated.

The project's required frontend settings must be available to Vercel and the
build workflow through their respective project configurations.
