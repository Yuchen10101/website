# Repository Guidelines

## Project Structure & Module Organization

This is an Astro 4 academic portfolio site. Application code is under `src/`:

- `src/pages/` contains routed Astro pages; `index.astro` is the home page and `pages/projects/` holds project listing and Markdown project content.
- `src/components/` contains reusable UI cards, header, footer, breadcrumbs, and table-of-contents components.
- `src/layouts/` provides shared page and Markdown layouts.
- `src/styles/global.css` contains site-wide styles.
- `public/` holds static, directly served assets such as project images, videos, and the CV. Keep asset references rooted at `/` (for example, `/Project2.png`).

## Build, Test, and Development Commands

Run commands from the repository root:

- `npm install` installs the locked dependencies.
- `npm run dev` starts the Astro development server, normally at `http://localhost:4321`.
- `npm run build` creates the production site in `dist/`; run this before submitting changes.
- `npm run preview` serves the latest production build locally.
- `npm run astro -- check` runs Astro's type and content checks when validating page or component changes.

There is no automated test suite configured. Treat a successful build and a browser check of affected routes and responsive layouts as the required validation.

## Coding Style & Naming Conventions

Use the existing Astro component style: four-space indentation in `.astro` files, semicolons in frontmatter imports and declarations, and scoped `<style>` blocks when styles only belong to one component. Use PascalCase for component and layout filenames (for example, `ProjectCard.astro`), lowercase route filenames, and descriptive static asset names that follow the established project prefixes (for example, `P3_Figure_11.png`). Keep shared CSS in `global.css` rather than duplicating it across pages.

## Content and Asset Changes

Project detail pages are Markdown files in `src/pages/projects/`. Preserve their frontmatter and verify every referenced image or video exists in `public/`. Optimize new media before adding it and avoid renaming existing assets unless all references are updated.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, lowercase summaries such as `update project 1`, `add experience`, and `font adjustment`. Keep commits focused and use the same style. Pull requests should explain the visitor-visible change, link related issues when applicable, list validation performed, and include screenshots for layout or visual updates. Do not commit generated `dist/` output or local editor settings unless intentionally needed.
