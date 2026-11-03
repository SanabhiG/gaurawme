# Copilot instructions for this repository

## Project overview
This repository is a static personal portfolio and project website deployed to Firebase Hosting. The main site is served from the repository root (`index.html`, `css/style.css`, and `js/*.js`), while additional static content lives under `gaurawme/` for blog/gallery/resume/simulation pages and support code under `physica-x/` and `pythonpracticew/`.

## Architecture
- Root site: `index.html` is the main landing page. Styling is in `css/style.css`; client-side behavior lives in `js/script.js` and related files.
- UI behavior: `js/script.js` manages the fixed header, smooth scrolling between anchor links, and the hide/show behavior on scroll. The other JS files (`carousel.js`, `contactform.js`, `dots.js`) are smaller page-specific helpers.
- Supplemental static pages: `gaurawme/` contains separate HTML pages for blog entries, gallery pages, resume, and simulation content. Treat these as individual static pages rather than a single app with a router.
- Deployment model: `firebase.json` serves the repo root as the public hosting directory and rewrites requests to `/index.html`. GitHub Actions in `.github/workflows/` deploy previews on pull requests and the live site on pushes to `main`.
- Assets: `assets/` contains the site's images and PDFs. Keep file paths relative to the hosting root when adding or moving content.
- Tooling: `package.json` contains front-end dependencies but no app-level build/test/lint scripts. This is primarily a static HTML/CSS/JS site; do not assume a bundler, framework, or server-rendered app is present unless a task specifically touches the simulation subprojects.

## Commands
There are no repository-defined build, lint, or test scripts in `package.json`.

For local verification of the static site:
- `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000`
- `npx firebase emulators:start` when you need Firebase-hosting behavior locally

For deployment:
- `firebase deploy` after authentication

When adding tests or validation later, keep them narrow and targeted to the file or feature being changed rather than assuming the full suite must run.

## Conventions and repo-specific patterns
- Prefer vanilla HTML/CSS/JavaScript for the root site; avoid introducing a framework or bundler unless the task clearly requires it.
- Preserve the existing DOM structure and CSS classes used by the fixed header and anchor behavior (`.nav`, `.nav.hidden`, `#main-header`, and section IDs).
- Keep scripts unobtrusive and DOM-ready: existing behavior is attached on `DOMContentLoaded` and avoids assumptions about a framework lifecycle.
- Maintain relative paths in links and assets so the site continues to work under Firebase hosting and root-level rewrites.
- Keep edits lightweight and static; this project is a portfolio website, not a server-backed application.
- If you touch Firebase or workflow files, preserve the hosting configuration in `firebase.json` and the generated deploy workflows under `.github/workflows/`.

## Editing guidance
- For page-level changes, prefer updating the existing HTML/CSS/JS files over creating new app structure or frameworks.
- For content-only edits, keep the site look-and-feel consistent with the current dark-themed portfolio styling and anchored section layout.
- For simulation-related work under `gaurawme/sims/`, respect that the project contains generated/dist assets and static demo pages; do not rework the whole site into a modern framework as part of a small fix.
