## Agent workflow

Maintained with the `setup-agent-workflow` skill. Edit values freely; keep the field names.

- Base branch: `main`
- Decision notes: `docs/decisions/`, written in Chinese. Every decision record, ADRs included, is a decision note written with the `decision-notes` skill. Files under `docs/decisions/archived/` are frozen history: read them as history and leave them unchanged.
- Tracker: GitHub issues on `origin`, through `gh`. Tickets for decision notes follow the `note-to-tickets` skill. A commit for a ticket says `Refs #N`, and the pull request that completes it says `Fixes #N`. The pull request that closes a note's last open ticket also moves the note to `implemented/`.
- Prose: documents, decision notes, tickets, pull request descriptions, and commit bodies are revised with the `plain-language` skill. House style: none.
- File size: files stay under 5,000 tokens (bytes / 4) so an agent can read them whole. `.file-size.json` lists excluded paths (docs, scene scripts, and `art/manifest.mjs` among them), exceptions with their reasons, and the baseline of older files over the limit, which may shrink but not grow. The pre-commit hook runs `scripts/check_file_size.py`.
- Hooks: pre-commit runs `.githooks/pre-commit`, which checks staged files with `scripts/check_file_size.py`. The hook is connected per clone: a new clone runs `git config core.hooksPath .githooks`. No pre-push hook.
- CI: none. Nothing runs on pull requests; the full suite is `npm test` and runs only when someone runs it locally.

| Change | Narrowest check |
|---|---|
| Rules in `src/game/**/*.ts` | `npx vitest run <test files>` |
| Content data in `src/content/**/*.ts` | `npx vitest run src/game/content.test.ts src/story/scenes.test.ts <rule test files that read the changed data>` |
| Scenes in `src/content/scenes/**/*.txt`, story code in `src/story/**/*.ts`, `art/manifest.mjs` | `npx vitest run src/story/scenes.test.ts` |
| Types in `src/**/*.ts`, `src/**/*.tsx` | `npm run typecheck` |
| Interface in `src/ui/**`, `src/styles/**` | `npm run dev` (launch config `game`), then open the changed page at `http://localhost:5730` |
| `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html` | `npm run build` |
| `scripts/gen-art.mjs` | `node --check scripts/gen-art.mjs` (syntax only; a real run calls the paid NovelAI API) |
| `.file-size.json`, `scripts/check_file_size.py`, `.githooks/pre-commit` | `python scripts/check_file_size.py --all` |

Docs (`**/*.md`) and images under `public/assets/` have no automated check.
