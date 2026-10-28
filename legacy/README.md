# FitCheck AI — Virtual Try-On Concept Demo

A self-contained, zero-dependency demo of an AI virtual fitting room for fashion brands.
Built to show partners what the product experience will feel like before the real
AI pipeline is wired in.

## Run it

No build step, no install.

1. Extract the ZIP
2. Open `index.html` in Chrome / Edge / Safari

(Optional) serve it so it behaves exactly like a hosted site:

```
npx serve .
```

## What to show in the demo

1. **Home** – landing page with the value proposition and a live animated hero.
2. **Try-On Studio**
   - Pick a sample model (Ahmed, Sara, Bilal) or **upload a photo** (stays in the browser).
   - Tap any garment in the catalog. A simulated AI pipeline runs (pose detection,
     segmentation, garment warping, relighting, render) and the look appears.
   - **Before / After** slider.
   - **Compare looks** – press `+` on up to 3 garments to see them side by side with a "best match" badge.
   - **AI insights** – fit score, color harmony, size recommendation, "pairs well with".
   - Save look, Share (link modal), Add to bag.
   - In photo mode: drag the garment, scroll to resize, or press **Auto-fit**.
3. **My Looks** – saved try-ons persist in the browser.
4. **How it works** – the production architecture (frontend → API → GPU try-on engine).

Keyboard shortcuts: `S` studio · `H` home · `R` random look · `Esc` close modal.
Dark / light mode toggle is in the top bar.

## What is simulated vs real

| Demo (this ZIP)                                   | Production                                               |
| ------------------------------------------------- | -------------------------------------------------------- |
| Illustrated SVG models and garments               | Shopper's real photo + brand catalog photos              |
| Garment overlay with manual drag / auto-fit       | Diffusion-based try-on model (pose + parsing + render)   |
| Fake 3s pipeline animation                        | Real GPU inference, 5–15s, cached per photo + garment    |
| Scores generated deterministically                | Fit / size recommendation from body measurement model    |
| localStorage for saved looks                      | User accounts, DB, CDN for generated images              |

## Files

```
index.html   – markup for all pages
styles.css   – design system (dark/light), layout, animations
data.js      – garment catalog, sample models, pipeline steps
render.js    – SVG renderers for garments and models
app.js       – app logic (routing, try-on flow, compare, looks, upload)
```

Everything is plain HTML/CSS/JS. Swap `render.js` + the try-on call in `app.js`
for a real API call when the backend is ready.
