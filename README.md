# Aksharamukha (Vanilla Web Edition)

This repository now ships as a dependency-free static site built with:

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

The deployable site is in `/docs` and is ready for static hosting (for example GitHub Pages).

## Run locally

Because this is a static site, no build step is required.

1. Open `/docs/index.html` directly in a browser, or
2. Serve `/docs` with any static file server.

## Project structure

- `/docs/index.html` – application markup
- `/docs/css/styles.css` – responsive styling
- `/docs/js/app.js` – UI logic and conversion flow
- `/docs/js/script-data.js` – script metadata and option definitions

## Conversion behavior

The site performs conversion from the browser using the public Aksharamukha plugin API endpoint.

## Notes

- There are no Vue, Python, or PowerShell runtime/build dependencies in this repository.
- There is no frontend framework build pipeline.
- `/docs` is the production output.

## License

GNU AGPL 3.0
