# Contributing to vaner-docs

Thanks for helping improve Vaner's public documentation.

## Local development

```bash
npm ci
npm run dev
```

Then open `http://localhost:3000`.

## Content structure

- All docs pages live in `content/docs/`.
- Use `meta.json` files to control sidebar ordering.
- Keep user-facing language concise and implementation details accurate.

## Style guide

- Prefer direct, active voice.
- Use sentence-case headings.
- Keep examples copy-pasteable.
- Link to canonical pages on `docs.vaner.ai` when referencing related concepts.

## Pull requests

- Keep each PR focused on one docs improvement.
- Include a preview URL in the PR description.
- Run `npm run build` before requesting review.
