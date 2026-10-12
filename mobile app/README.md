# TeenLaunch mobile app

This folder is independent of the original website. Open index.html for the new app home screen. The site/ folder contains copies of the public TeenLaunch pages and assets downloaded on 12 October 2026. Shared mobile styling and bottom navigation are applied to the copied pages. Original content, translations, authentication requirements, and feature scripts are retained.

This is an app-style progressive web app, not an App Store or Google Play binary. No dependencies are required for the static frontend. For reliable account features and installation, serve this folder over HTTP during development and HTTPS when hosted. Opening index.html directly is suitable for viewing the design; some browser features require HTTP/HTTPS.

The app uses the existing production API at https://teenlaunch-production.up.railway.app/api. Account, opportunity, Career DNA, journey, portfolio, and AI features need that service and its permitted CORS origins. A new app origin may need to be allowed by the backend. Login sessions are specific to the app origin. No backend code or production settings were changed. End-to-end account and AI flows have not been verified.

On a supported mobile browser, use Add to Home Screen (iOS: Share > Add to Home Screen). Installation needs HTTPS and browser support. Previously visited public pages can be cached; live API features need an internet connection.

Content comes from https://www.teenlaunch.app/index.html and its linked public pages. It is a snapshot; later website edits do not automatically sync. Some upstream asset references may already be missing. download-report.json records the initial download attempts; several failed entries are script-relative crawl guesses, not real website links. sync-website.ps1 is the original download utility; rerunning it overwrites copied pages and requires reapplying app styling.
