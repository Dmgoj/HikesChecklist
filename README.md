# HikesChecklist

Search mountains and peaks worldwide, log in, and keep a checklist of the ones you've visited.

## Stack

- **Backend:** ASP.NET Core Web API (.NET 10), EF Core + SQLite, ASP.NET Core Identity + JWT auth
- **Frontend:** React + TypeScript (Vite)
- **Peak data:** seeded from [GeoNames](https://www.geonames.org/) (see `CREDITS.md`)

## Running locally

### 1. One-time setup

```
cd server/HikesChecklist.Api
dotnet user-secrets set "Jwt:Key" "<a long random secret>"
```

### 2. Seed the peaks database

Downloads GeoNames' `allCountries.zip` (~450MB) and loads mountain/peak entries into the database. Takes a few minutes; safe to re-run.

```
cd server/HikesChecklist.GeoNamesIngest
dotnet run -- --data-dir ./data
```

### 3. Run the API (applies EF Core migrations automatically)

```
cd server/HikesChecklist.Api
dotnet run --launch-profile https
```

API runs at `https://localhost:7255`.

### 4. Run the client

```
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`.

## Notes

- The SQLite dev database lives at `server/HikesChecklist.Api/hikeschecklist.dev.db` (gitignored).
- JWTs are valid for 7 days (see `Jwt:ExpiryMinutes` in `appsettings.json`) — there's no refresh-token flow yet, just re-login after expiry.
- Map view (Leaflet) is planned but not yet implemented; peak detail pages currently show a placeholder.

## Troubleshooting

### `gh` (GitHub CLI) not found on Windows, even though it's installed

On some Windows setups `gh` is installed but its folder never made it into `PATH` (e.g. installed
before the machine's `PATH` was refreshed, or via an installer that didn't register it). Symptoms:
`gh` works fine in one shell but `'gh' is not recognized` in another (PowerShell, Git Bash, etc.).

1. Confirm it's actually installed and find it:
   ```powershell
   Test-Path "C:\Program Files\GitHub CLI\gh.exe"
   ```
2. If found but not on `PATH`, add it permanently (persists across new terminals; requires a new
   shell/terminal restart to take effect):
   ```powershell
   [Environment]::SetEnvironmentVariable(
     "Path",
     "$([Environment]::GetEnvironmentVariable('Path', 'Machine'));C:\Program Files\GitHub CLI",
     "Machine"
   )
   ```
   (Run as Administrator, or use `"User"` scope instead of `"Machine"` if you don't have admin rights.)
3. As a one-off workaround without editing `PATH`, call it by full path:
   ```powershell
   & "C:\Program Files\GitHub CLI\gh.exe" auth status
   ```
