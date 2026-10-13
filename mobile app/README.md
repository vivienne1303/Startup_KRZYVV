# TeenLaunch Android app

This folder contains an independent Capacitor Android project. The original website remains at the repository root. The existing mobile home screen, bottom navigation, copied website pages and feature scripts are reused.

The Android project is prepared, but an APK has not been compiled on this machine because Android Studio, the Android SDK and a Java runtime were not found. The browser preview is built separately for GitHub Pages as described below.

## Public mobile browser preview

Share `https://teenlaunch.app/mobile%20app/` (the existing domain redirects to `https://www.teenlaunch.app/mobile%20app/`). Users can open it on any internet connection without installing an APK.

The Pages workflow installs this folder's locked dependencies, checks the mobile app, then runs `npm run pages:check`. `scripts/build-pages.mjs` creates a `.pages-site/` deployment artifact with the existing website's static files unchanged and the clean mobile bundle at `mobile app/`. It never publishes backend code, environment files, Android projects, QA profiles, node_modules or ZIP archives. No production website source or backend source is changed by this publishing setup. The Capacitor build continues to use `www/` independently.

The browser preview keeps the shared API/session integration, mobile styling and navigation, uses relative paths under the encoded subdirectory, and disables preview service-worker registration to avoid stale builds or controlling the main website. Portfolio sharing points to the public website. Login defaults to the mobile home screen and preserves explicit feature return paths. Website and preview share session storage on the same hostname; native Android app storage remains separate.

Local preview verification: `npm run pages:check`, `npm test`, then `node scripts/preview-browser-check.mjs` on Windows with Microsoft Edge installed (or set `BROWSER_PATH`). The browser check uses a phone-sized viewport and intercepted API fixtures: it does not create users or send production login requests. It verifies home/Explore/resources navigation, protected-page redirects, login return paths, persistence after reload, public portfolio URLs, no JS exceptions or asset 404s, and no service-worker registration. Actual account login and authenticated workflows still require a real account for end-to-end verification.

## Project layout

- `index.html`, `app.css`, `app.js`: mobile home screen source.
- `mobile-pages.css`, `mobile-pages.js`: shared mobile layout and navigation.
- `site/`: mobile copies of website pages, feature scripts, styles and assets.
- `src/native.js`, `src/native.css`: native links, clipboard, printing, back handling, keyboard and safe-area adjustments.
- `src/session.js`: persistent session and refresh-token handling shared by every bundled page.
- `scripts/build.mjs`: creates a clean `www/` from approved runtime directories and file types.
- `www/`: generated web bundle; do not edit manually or commit.
- `android/`: Android Studio project. Application ID: `app.teenlaunch.mobile`.
- `tests/`: automated session, backend refresh, bundle and native behaviour checks.
- `scripts/prepare-android-icons.ps1`: regenerates Android launcher/splash images from the existing TeenLaunch logo.
- Preview servers, website download utilities, QA/browser profiles and reports are development material and are excluded from the bundle.

The current frontend is a snapshot of the website. Website changes do not automatically appear in the mobile copies. Do not rerun the old download/sync utilities without reviewing the resulting diff: they can overwrite mobile fixes.

## Backend and Supabase

The app calls the existing HTTPS API at:

`https://teenlaunch-production.up.railway.app/api`

Supabase access remains on the backend. No backend .env files, Supabase keys, service-role credentials or signing keys are copied into the mobile bundle. No production API writes were used for verification.

Two backend source files implement session renewal:

- `../backend/controllers/sessionController.js`: exchanges refresh tokens using a fresh Supabase client per request, without persistent server-side auth state.
- `../backend/routes/authRoutes.js`: registers `POST /api/auth/refresh`.

Request: `{ "refreshToken": "<user refresh token>" }`.

Response: `{ "token": "<access token>", "refreshToken": "<rotated refresh token>", "expiresAt": 123, "user": { ... } }`.

The endpoint uses the backend's existing Supabase configuration; no new environment variables are required. Invalid sessions return 401; temporary upstream failures return 503. Successful responses disable caching.

On 2026-10-12, the production refresh endpoint returned HTTP 400 for an empty request with “A valid refresh token is required”, confirming the route is now present. No backend deployment was performed as part of the Pages preview setup. A real user's token rotation has not been tested against production. The app preserves its stored session on network/server failures and shows a login-renewal error if the endpoint is missing in another environment. Existing logins that never saved a refresh token need one fresh login.

The Android origin is `https://localhost`. The inspected backend CORS source already allows it. A read-only production preflight check returned HTTP 204 with Access-Control-Allow-Origin: https://localhost and allowed Authorization headers. No wildcard CORS change or HTTP fallback is introduced.

Session tokens are runtime user data stored in the WebView's localStorage, within Android app data. They survive normal process restarts and same-app updates, but uninstalling or clearing app storage removes them. Passwords are not saved. Android backup is disabled. A shared fetch layer refreshes before expiry, coordinates concurrent refresh calls, updates captured Authorization headers, retries a 401 once, and clears both tokens on logout. Refresh failures do not silently sign users out unless the server confirms an invalid refresh token.

## Native behaviour

- Web pages and assets are bundled locally, so the app does not depend on your laptop or the same Wi-Fi.
- Account, database and AI features still require an internet connection.
- External HTTPS/HTTP links open the native browser; internal links stay within the app.
- Email/phone links hand off to Android.
- Android back dismisses the keyboard, an open dialog or the navigation menu first; otherwise it navigates back, returns home or minimizes at the home screen.
- Keyboard resize and safe-area styling prevent bottom tabs from covering text entry.
- Portfolio sharing uses public `https://www.teenlaunch.app/pages/public-portfolio.html?slug=...` links, rather than a device-local URL.
- Portfolio Print / Save as PDF opens Android's print interface through the local TeenLaunchPrint plugin.
- Browser install prompts, the web manifest and PWA service-worker caching are excluded/disabled in the native app.

The source folder can still preview the design. Use the generated `www/` folder when testing the fully integrated web bundle.

## Build and open Android Studio

Install Android Studio 2025.2.1 or newer. In its SDK Manager, install Android SDK Platform 36 and the build tools requested by Gradle. Use Android Studio's bundled JDK. Node 22 or newer is required for the mobile package; Node is installed at `C:\Program Files\nodejs` on this machine but may need adding to your terminal PATH.

From PowerShell in the repository root:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd ".\mobile app"
npm.cmd run check
npm.cmd run android:sync
npm.cmd run android:open
```

Alternatively, open Android Studio, choose **Open**, and select the `mobile app/android` folder. Do not open the repository root as the Android project.

The first Gradle sync requires internet to download Gradle and Android libraries. If prompted, select Android Studio's bundled JDK and accept SDK installations/licenses. On this OneDrive-managed project, ensure files are downloaded locally. For more reliable native builds, use a fully local project copy outside OneDrive while preserving this folder structure and reinstalling the mobile dependencies with `npm.cmd ci`.

After frontend changes, rerun `npm.cmd run android:sync` before building the APK. Native Java/resource changes are already inside `android/`.

## Generate an installable test APK

1. Wait for Android Studio's Gradle sync to finish.
2. Select the `app` module and `debug` build variant.
3. Choose **Build > Generate App Bundles or APKs > Generate APKs**. Some versions label this **Build APK(s)**.
4. Find the APK at `android/app/build/outputs/apk/debug/app-debug.apk`.
5. Copy it to your Android phone, open it and allow installation from that file source when Android asks.

You can also connect the phone by USB, enable Developer options and USB debugging, and use Android Studio's Run button.

The debug APK is suitable for testing. A distributable release APK needs a separately managed signing keystore. Never commit a keystore or password. Google Play publication is a separate step and has not been performed.

## Verification and remaining device checks

Latest verification: all 20 automated tests passed; all 33 HTML pages were built and synced into Android; the installed dependency audit reported zero vulnerabilities. Backend JavaScript syntax and Android manifest XML checks passed. APK compilation was attempted and stopped with: JAVA_HOME is not set and no java command could be found in your PATH.

Run `npm.cmd run check` to rebuild and run the automated checks. Tests verify session rotation, concurrency, retry bodies, offline handling, logout races, backend refresh isolation, all 33 HTML pages' local references, native browser/clipboard/back/keyboard/print wiring, and exclusion of development files/private key material.

The CLI is pinned to 8.4.3 to avoid the xcode/uuid advisories reported for CLI 8.5.3. The native runtime remains on Capacitor 8. An explicit CLI colour dependency prevents Node from reaching into the parent website's OneDrive-only optional dependency.

Actual APK compilation, emulator/device behaviour, live Supabase authentication, token rotation against production, AI calls, external application handoff and Android printing still require device testing. Static/unit checks do not replace those checks. Test at least login/register/logout, app restart, token expiry, opportunities/applications, Career DNA, portfolios/sharing/PDF, Copilot, keyboard and back navigation. No accounts were created or production data changed during preparation.

Official references:
- https://capacitorjs.com/docs/getting-started
- https://capacitorjs.com/docs/getting-started/environment-setup
- https://capacitorjs.com/docs/basics/workflow
- https://capacitorjs.com/docs/android/deploying-to-google-play
