# FitCheck AI

An AI virtual try-on platform for fashion brands. Shoppers see garments on themselves, from a photo or their camera, before they buy.

- **Live demo:** https://fitcheck-beryl-two.vercel.app ([open the Studio](https://fitcheck-beryl-two.vercel.app/app/studio))
- **Source:** https://github.com/Hassan663/fitcheck-ai

This repository is a **fully client-side product demo**. There is no backend, no external API and no paid service. Everything runs in the browser, and shopper photos never leave the device.

## Setup

Requires Node.js 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Command             | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run build`     | Type-check (strict) and build to `dist/`    |
| `npm run preview`   | Serve the production build locally          |
| `npm run lint`      | ESLint (typescript-eslint strict + hooks)   |
| `npm run typecheck` | TypeScript only                             |

> The camera only works on a secure origin: `localhost` or HTTPS. To demo on a phone over your LAN, use `npm run build && npx vite preview --host` behind an HTTPS tunnel, or use the upload option.

## Partner demo walkthrough (about 5 minutes)

1. **Landing (`/`).** Start at the hero: the browser mockup cycles through garments and models on its own. Scroll through the three feature sections, the four-step "How it works" strip, the metrics, and the pricing toggle (monthly/yearly). Use the theme toggle in the nav to show dark and light modes.
2. **Open the studio** (`/app/studio`). This is the core of the demo.
   - Pick **Ahmed, Sara or Bilal** on the left. Each change re-runs the simulated AI pipeline.
   - Tap any garment in the catalog. The five-step pipeline (pose → segmentation → warp → relight → render) runs for about 3 seconds, then the look appears with **AI insights**: fit score, color harmony, occasion match, recommended size, and "pairs well with".
   - Switch to **Before / After** and drag the divider.
   - Press **+** on up to three garments, then open **Compare**. The best match is highlighted.
   - Press **R** for a random look.
3. **Use your own photo.**
   - **Take a photo**: live mirrored preview with a body-outline guide, a 3-2-1 countdown, then retake or use the photo. On phones you can switch between front and back cameras. If you deny camera permission, you get a clear error with an "Upload instead" option.
   - Or **drag and drop** a photo onto "Upload photo".
   - In photo mode, drag the garment, pinch or scroll to resize, use the rotation slider, or press **Auto-fit** to animate it onto the torso.
   - Refresh the page: the photo is still there (stored in IndexedDB).
4. **Save, share, buy.** In the footer bar: **Save look**, **Share** (a link dialog with copy), and **Add to bag**. Prices are in PKR.
5. **Brand admin views.**
   - **Catalog**: a sortable table with search and status filters. Use **Add garment** to choose cut, neck, colors, pattern and pocket with a live preview. Saved garments appear in the studio immediately.
   - **Looks**: saved try-ons, with open, buy, and delete (with undo).
   - **Analytics**: KPIs, try-ons over time, top garments and a conversion funnel, with 7/30/90-day ranges. Every chart can switch to a table view.
   - **Settings**: rename the workspace, change the **brand color** (the whole UI re-themes live), view the API key placeholder, and **Delete all my photos**.

## What is simulated vs. production

| Area | This demo | Production |
| --- | --- | --- |
| Try-on rendering | Illustrated SVG models; garment overlay with manual or auto-fit placement | Diffusion-based try-on model (pose estimation + human parsing + garment warping + relighting) served via API |
| Compute | Runs entirely in the browser | GPU inference fleet, under 10 s p95, results cached per photo + garment |
| AI pipeline | Timed 3 s animation | Real progress events streamed from the render job |
| Fit / size / color insights | Deterministic pseudo-scores per subject + garment | Body-measurement and fit models trained on brand size charts and returns data |
| Shopper photos | Memory + IndexedDB on this device only; never uploaded | Encrypted upload, processed for the render, auto-deleted (24 h default, zero-retention option) |
| Catalog | Built-in SVG garments + custom ones in `localStorage` | Brand catalog synced from Shopify / WooCommerce / API, with automatic garment segmentation |
| Saved looks, bag | `localStorage` | User accounts, database, CDN-hosted renders; checkout hands off to the brand's store |
| Share links | Fake URL, copy only | Signed, expiring links to a watermarked render |
| Analytics | Generated demo data | Event pipeline from the storefront widget |
| Workspaces, auth, API keys | Single dummy workspace, placeholder key | Multi-tenant accounts, SSO, scoped and rotatable API keys |

## Tech stack

- **Vite + React 18 + TypeScript** (strict, no `any`)
- **Tailwind CSS** with CSS-variable design tokens for dark/light themes and the live brand accent
- **Framer Motion** for page transitions, staggered reveals and layout animations
- **react-router-dom** with lazy-loaded routes
- **recharts** (loaded only on the Analytics route)
- **idb-keyval** for photo persistence
- **lucide-react** icons, **Inter** self-hosted via `@fontsource/inter` with a metric-matched fallback to avoid layout shift

## Project structure

```
src/
  components/
    ui/            Design system: Button, Card, Badge, Tabs, SegmentedControl, Slider,
                   Dialog/Drawer, Toast, Tooltip, Skeleton, EmptyState, Avatar,
                   Input, Select, Switch, Accordion, DropdownMenu
    StudioMockup   Animated hero mockup
    Svg            React wrappers for the garment/model renderers
  context/         Theme (mode + accent), store (catalog, looks, bag, photo), toasts
  hooks/           Focus trap / scroll lock, simulated loading
  lib/
    catalog.ts     Garments, sample models, pipeline steps (typed port of the original data.js)
    render.ts      SVG renderers (typed port of the original render.js)
    scoring.ts     Fit / color / occasion scores, size recommendation, pairings
    photoStore.ts  IndexedDB persistence + image downscaling
  pages/
    marketing/     Landing page and its sections
    app/           App shell, Studio (+ studio/ parts), Catalog, Looks, Analytics, Settings
legacy/            The original single-page vanilla JS demo, kept for reference
```

## Replacing the simulation with the real API

The try-on render is isolated in the Studio:

- `src/pages/app/studio/PipelineOverlay.tsx`: swap the timed animation for progress events from the render job.
- `src/pages/app/studio/Stage.tsx` (`SubjectRender`): show the returned render image instead of the SVG/overlay composite.
- `src/lib/scoring.ts`: replace the deterministic scores with the fit service response.
