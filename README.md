# vxThails

A lightweight, client‑side tile matching game. Two visual themes are included (Thai and Dinosaurs). The app runs as a static site (no server required) and ships with prebuilt PNG/SVG assets under `assets/`.

## Features
- Simple, fast in‑browser gameplay (no build step)
- Two tile sets: `thai`, `dinosaur`
- Touch and mouse support, language toggle (Thai/English)
- Optional tools to generate or refresh tile art

## Quick Start
Open `index.html` directly, or serve the folder with a static server (recommended):

- Python 3
  ```bash
  python3 -m http.server 8000
  # open http://localhost:8000/
  ```

- Node (using `npx serve`)
  ```bash
  npx serve .
  # open the URL it prints
  ```

URL options:
- `?tileset=thai|dinosaur` — choose the tile set.

## Project Structure
- `index.html` — App shell and UI markup
- `styles.css` — Visual styles
- `main.js` — Game logic, rendering, input, and i18n
- `assets/` — Shipped art used by the app
  - `assets/tiles_png/` — PNG tiles used by the game
    - `assets/tiles_png/thai/`
    - `assets/tiles_png/dinosaur/`
  - `assets/tiles/` — SVG placeholders (by theme)
    - `assets/tiles/thai/`
    - `assets/tiles/dinosaur/`
  - `assets/backgrounds_png/` — Backgrounds per theme
- `tools/` — Optional Node.js ESM scripts to generate/refresh assets

## Asset Generation (Optional)
You can regenerate or extend the art using the scripts in `tools/`. The repository already includes assets.

Placeholder SVGs
```bash
node tools/generate_placeholder_svgs.mjs [--force] [--palette=color|mono]
```
Output: `assets/tiles/<set>/<key>.svg`

Themed PNG tiles (OpenAI Images API)
```bash
OPENAI_API_KEY=... node tools/generate_thai_tiles.mjs \
  [--set=thai|dinosaur] [--palette=color|mono] [--allow-official-symbols] \
  [--size=1024x1024] [--concurrency=2] [--force] [--no-resize] \
  [--sheet-cols=N --sheet-rows=N --sheet-name=name]
```
Output: `assets/tiles_png/<set>/<key>.png`
Backgrounds: `assets/backgrounds_png/<set>.png`
Resizing: uses `sips` on macOS, or ImageMagick if available; disable with `--no-resize`.

Notes
- Node.js 18+ is required for native `fetch` and ESM `.mjs`.
- Do not commit secrets. Provide `OPENAI_API_KEY` via environment variable only.

## Development
- JavaScript style: 2‑space indentation, semicolons, `camelCase` for variables/functions, constants in `UPPER_SNAKE` when appropriate.
- Keep frontend code framework‑free and modular within `main.js` (functions over classes, early returns, small helpers).
- Match existing style; keep diffs minimal and focused.

## Testing
Manual smoke tests in a modern browser:
- Start a new game; verify matching, shuffle/hint, score/level progression, win/lose states.
- Resize window and test on mobile; confirm responsive layout.
- Verify both tile sets via `?tileset=thai|dinosaur` and the language toggle.
- Cross‑browser spot check (Chromium/WebKit/Gecko) when changing DOM/CSS or performance‑sensitive code.

## Commit & PR Guidelines
- Commits: Prefer Conventional Commits (e.g., `feat:`, `fix:`, `docs:`). Keep them small and descriptive.
- PRs: Include a clear description, linked issue, and before/after screenshots or a short clip for UI changes.
- Include generated assets in PRs if required by the change; note the tool command used.
- Validate that `index.html` loads with no console errors and assets resolve under a static server.

## Security & Configuration
- Asset tools may require `OPENAI_API_KEY`; provide via environment variable only. Never commit keys.
- The app is a static site — avoid introducing runtime secrets or third‑party trackers.

## Gameplay Tips
- Match identical tiles with at most two turns in the connecting path.
- Use “Shuffle” or “Hint” if stuck.
- Switch tile set and language from the in‑game menu.

## License
- Code: GPL‑3.0‑or‑later — see `LICENSE`.
- Images (`assets/tiles*`, `assets/backgrounds_png`): CC BY‑SA 4.0 — see `assets/LICENSE`.
- Sounds: third‑party and licensed separately — see `CREDITS.md`.

© Vionix Consulting

## Publisher attribution

The complete footer identity links to [Vionix Consulting](https://vionix.cloud), with the locally bundled logo centred beside the product/publisher text. Icon-labelled About/Support controls share equal-width columns. About opens a native dialog with a fixed close header, English/Thai identity and purpose, icon-led source/issue resources, separate code/art licence links, and a copyright/Support footer. Escape and Close dismiss the dialog and restore focus to About. Attribution uses the current game theme. The footer groups compact About/Support actions. Support is also available inside About and opens an English/Thai native dialog with the official Ko-fi Tip Panel for [Vionix Consulting](https://ko-fi.com/vionixconsulting). Optional one-time/monthly contributions support this and other free Vionix projects without game privileges. The iframe loads only on click, sends no game state or referrer, and is removed on close. The close area stays visible while the panel scrolls; the compact iframe sits within symmetric responsive margins beneath the fixed header without repeated explanatory copy. A ten-second loading delay reveals a new-tab recovery link. Opening from About closes About first and returns focus to its persistent trigger. Game state and timers continue normally. Native focus restoration is backed by explicit originating-button focus; delayed close events do not steal focus from a newly selected control. Ko-fi controls its internal card layout and payment UI/configuration; frame events never confirm payment completion. Actual monthly/payment behavior depends on Ko-fi account configuration and provider availability; delayed embeds can use the external recovery link.

## Usage-based support reminders

Reminders are optional, local to this app/browser, and separate from gameplay toasts. Only cleared levels count; clicks, hints, shuffles, losses and restored scores do not. Initial eligibility needs three cleared levels, 72 elapsed hours since the first, and activity on three local calendar dates. Further cycles need three renewed clears and 28 elapsed days; clears during cooldown count.

A floating card offers Support, Not now and Don’t remind me with no auto-hide. Showing consumes its cycle. Not now and manual Support reset count/cooldown; permanent opt-out stays disabled after manual Support. Reload removes the session card without returning during cooldown. Present only in a focused visible page after level-clear transitions/feedback or gameplay ends. Renewed tile/hint/shuffle interaction suspends the same card; boards, scores, timers and progression continue unchanged. Localized English/Thai copy, polite announcements, wrapped 44px actions and measured insets preserve controls and footer attribution. Payment opens only on explicit Support and restores focus to the persistent footer control on close.

Local helpers in `main.js` keep policy, page-session presentation and game-outcome callbacks separate. Version-1 `vxThails.support-reminders` metadata contains bounded counts, three local dates, first-use/cooldown timestamps and opt-out; existing scores are never reconstructed. App-specific Web Locks coordinate updates and claims across tabs, with foreground/safety rechecked inside the lock. Unavailable/corrupt storage or coordination disables automatic reminders while manual Support and gameplay remain available. No game state, donor records, backend, runtime dependency or tracking request is added. Deterministic policy/browser verification uses the workspace harness, controlled clock/storage and intercepted Ko-fi; game matching, progression, shuffle/hint, language and tile-set smoke checks remain required.

Run the local policy suite with `node --test tests/support-reminder-policy.test.mjs`. Browser verification uses the workspace harness with intercepted payment/audio fixtures; machine-specific browser imports stay outside this repository.

`tests/crypto-support.browser.mjs` exports `verifyCryptoSupport` for that harness. Supply a Playwright page, local URL, app name, locale, viewport width and an independent QR decoder. It covers all eight destinations, method switching, clipboard recovery, keyboard controls, compact layouts, close/reopen cleanup and preserved game state.

## Crypto support

Support offers Cash/Crypto tabs with a decorative banknote/coin icon beside each label and Cash selected on every opening. Cash opens the existing Ko-fi checkout; English/Thai labels follow the application language where supported. Switching methods preserves the mounted checkout and selected network; closing removes both. Crypto uses one persistent icon selector ordered Bitcoin, Ethereum Mainnet, Solana, Base, Arbitrum One, Optimism, Polygon PoS and BNB Smart Chain, with uniform rows and keyboard arrows/Home/End/typeahead, Enter/Space selection, Escape cancellation and outside dismissal. Public receiving addresses are maintained by the wallet owner. Asset captions are familiar, nonexclusive hints: BTC for Bitcoin; otherwise the native asset, USDC, USDT and other tokens, including Solana. Show a full selectable address, a primary Copy address action and a local address-only 180px QR. The concise panel has no network-instruction footer. Use 24px desktop/16px mobile outer padding, 16px section gaps, 4px receiving-label/address grouping and 12px before Copy. Reserve two address lines at widths up to 480px. QR starts behind Show QR code at widths up to 420px or heights up to 720px. Only successful clipboard completion shows Copied for two seconds; live feedback takes no layout space. Failed copy selects the address and offers manual recovery. Network changes discard stale clipboard results; new attempts, changes and close clear the feedback timer. Crypto performs no wallet connection, transfer, balance lookup or payment confirmation. English/Thai labels follow the existing game language. Wallet addresses and crypto UI stay in the existing game script; games, timers, scores and reminder policy are unchanged.

The static host serves `assets/vendor/qrcode-generator.js` (qrcode-generator 2.0.4, Kazuhiko Arase, MIT). The complete notice is in `assets/vendor/qrcode-generator.LICENSE`; no build step, remote QR service or additional runtime origin is required. Include these local assets when publishing the site.
