# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HikesChecklist: search mountains/peaks worldwide, log in, and track which ones you've visited. Future
phase (not yet built) adds a map view on the peak detail page.

## Commands

### Backend (`server/HikesChecklist.Api`)

```
dotnet build                                  # from repo root, builds both server projects
cd server/HikesChecklist.Api && dotnet run --launch-profile https   # https://localhost:7255, auto-applies migrations in Development
```

EF Core migrations use the local `dotnet-ef` tool (manifest at repo root, run from `server/HikesChecklist.Api`):

```
dotnet tool run dotnet-ef migrations add <Name> -o Data/Migrations
dotnet tool run dotnet-ef database update
```

JWT signing key is not committed — set once via `dotnet user-secrets set "Jwt:Key" "<secret>"` inside
`server/HikesChecklist.Api`.

No test project exists yet in either server project.

### GeoNames ingestion (`server/HikesChecklist.GeoNamesIngest`)

```
cd server/HikesChecklist.GeoNamesIngest
dotnet run -- --data-dir ./data          # downloads allCountries.zip (~450MB) if not cached, seeds Peaks
dotnet run -- --data-dir ./data --force  # re-download instead of using the cache
```

Idempotent — upserts by GeoNames ID, safe to re-run. Takes several minutes (streams ~13.5M lines).

### Frontend (`client/`)

```
npm install
npm run dev        # http://localhost:5173
npm run build       # tsc -b && vite build
npm run lint        # oxlint
```

No test runner is configured yet.

## Architecture

Two independent halves in one repo, run separately in dev (no orchestration script):

- `server/HikesChecklist.Api` — the only backend project with real logic. Single-project ASP.NET Core
  Web API, no Domain/Application/Infrastructure layering: controllers talk to `Data/AppDbContext`
  directly.
- `server/HikesChecklist.GeoNamesIngest` — a separate console app that **project-references**
  `HikesChecklist.Api` to reuse its `AppDbContext`/`Peak` entity rather than duplicating the model in a
  shared library. It is a one-off data-loading tool, not part of the running app.
- `client/` — Vite/React/TypeScript SPA, talks to the API over HTTP only (no server-side rendering, no
  shared code with the backend).

### Data model (`server/HikesChecklist.Api/Models`, `Data/AppDbContext.cs`)

- `ApplicationUser` — thin `IdentityUser` subclass; auth is entirely ASP.NET Core Identity.
- `Peak` — the GeoNames-seeded catalog. `GeoNameId` has a unique index and is the ingestion tool's
  upsert key; do not change its meaning without also updating the ingestion tool.
- `VisitedPeak` — join entity (`UserId` + `PeakId`) with a **unique composite index on
  `(UserId, PeakId)`** — a user can only have one visited-record per peak (single date/notes, not a
  visit log). Changing this to support multiple visits per peak means dropping that constraint and
  rethinking the API shape (currently `PUT/DELETE /api/visited-peaks/{peakId}` assume exactly one row
  per user/peak pair).

### Auth flow

Identity's `UserManager` issues no cookies; `Services/JwtTokenService.cs` mints a bearer JWT on login
(`Controllers/AuthController.cs`), signed with `Jwt:Key` from config/user-secrets. Tokens are long-lived
(7 days, `Jwt:ExpiryMinutes` in `appsettings.json`) — there is deliberately no refresh-token flow; a
hobby app just re-logs-in after expiry. The client stores the token in `localStorage`
(`client/src/api/client.ts`, `client/src/auth/AuthContext.tsx`) and attaches it as `Authorization: Bearer`
on every request; a 401 clears it client-side.

### API shape

All routes under `/api`. `PeaksController` is public/read-only (search + detail). `VisitedPeaksController`
is `[Authorize]`-only and always scopes queries to the caller's user id from the JWT claim — there is no
admin/cross-user view. DTOs live in `Dtos/` and are hand-mirrored on the client in
`client/src/types/index.ts` (no OpenAPI codegen).

### GeoNames ingestion pipeline

`GeoNamesLineParser.cs` parses one tab-delimited GeoNames line at a time (never loads the whole file
into memory) and filters to feature class `T` with codes `MT`/`MTS`/`PK` before allocating a record.
`Program.cs` batches upserts (~2,000 rows/batch, one transaction per batch) and falls back to the `dem`
column when GeoNames' own `elevation` field is empty/zero. If you need more peak types later, both the
filter set in `GeoNamesLineParser` and the recommendation in `README.md`/`CREDITS.md` should stay in
sync (GeoNames data is CC-BY 4.0 — attribution is required and lives in `CREDITS.md`).

### Frontend structure

`client/src/api/` — thin `fetch` wrappers per resource (no React Query; deliberate simplicity choice for
this app's small endpoint count). `client/src/auth/AuthContext.tsx` is the single source of auth state.
Routing (`client/src/router.tsx`) gates `/visited` via `components/ProtectedRoute.tsx`. `PeakDetailPage`
has a "Map coming soon" placeholder — the data model already carries `Latitude`/`Longitude` for this, so
adding Leaflet later is frontend-only.

## Config / secrets

- `server/HikesChecklist.Api/appsettings.json` holds non-secret defaults (connection string points at
  `hikeschecklist.dev.db`, CORS origin defaults to `http://localhost:5173`). `Jwt:Key` is intentionally
  absent from committed config — see user-secrets command above.
- SQLite is used for dev; the model deliberately avoids SQLite-specific types so a future move to
  Postgres only requires regenerating migrations against the Npgsql provider, not schema changes.
