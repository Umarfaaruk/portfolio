# Umar Faaruk — AI/ML Engineer Portfolio

Futuristic, 3D-animated personal portfolio of **Mahmmed Umar Faaruk** — AI/ML engineer and freelance web developer from Hyderabad, India. 11 client builds shipped, plus published deep-learning research.

**Live site:** https://umarfaaruk.github.io/portfolio/

## Highlights

- 🎨 Dark **editorial** design — condensed **Oswald** display type on **Inter** body copy, generous whitespace, freelance-first layout
- 🌌 Three.js **r160 (ES modules + import maps)** background — particle field that morphs into 7 formations as you scroll (sphere → galaxy → DNA helix → grid → torus knot → cube lattice → vortex), recolored for light theme, with neural synapse lines and cursor-repulsion physics
- 🧩 Services section with a scroll-driven progress line + 11 numbered client-work case-study rows
- ⌨️ Interactive terminal playground (17 commands, incl. a Telugu Matrix rain Easter egg)
- 🖼️ Custom HUD-style SVG project covers — no stock imagery
- ⚡ Boot preloader, decoder text effect, kinetic split-character titles, magnetic buttons, custom cursor ring
- 🆕 Latest CSS: scroll-driven animations (`animation-timeline: view()`), `@property` animated conic borders
- 📊 Live GitHub stats via public API; JSON-LD structured data; custom 404
- 📱 Fully responsive and accessible (focus states, reduced-motion and no-WebGL fallbacks)
- 🚀 Zero build step — deploys straight to GitHub Pages

## Featured work

| Project | Domain | Result |
|---|---|---|
| Edunox — AI study platform | Freelance / AI product | Launched — **15,000+ LinkedIn impressions**, engagement from Oracle & Morgan Stanley professionals |
| Strategic Arc Consultants — analytics dashboard | Freelance / consulting | Delivered — replaced manual reporting with a live Next.js + TypeScript interface |
| [Krishna House of Fine Jewellery](https://krishna-house-of-fine-jewellery.vercel.app) | Freelance / luxury retail | Live client site |
| [Jobly](https://jobly-pearl.vercel.app) — ATS resumes & job matching | Freelance / AI product | Live |
| [Raya](https://raya-by-the-house-of-namya-demo.vercel.app), [Salt & Pepper Fusion](https://salt-pepper-fusion.vercel.app) | Freelance / D2C & hospitality | Live |
| [Café Spice](https://qr-table-ordering-system.vercel.app) — QR table ordering SaaS | Freelance / restaurant tech | Live — schema, backend and ordering flow built from scratch |
| [Bazaar Premier](https://bazaar-premier.vercel.app), [Founder & Growth](https://founder-growth-website.vercel.app), [Aerowash](https://aerowash-lac.vercel.app), [Aura Villa](https://villa-demo-lemon.vercel.app) | Freelance / web | Live client & concept sites (Aerowash migrated off legacy WordPress) |
| Fire & Smoke Detection (YOLOv11) | Computer Vision | 93.5% mAP @ 60 FPS — **published research** (AI Health Care book, in press) |
| Adaptive AI-SIEM (federated learning + blockchain) | Cybersecurity | 99% accuracy, 0.01 FPR |
| Craft Connect (AWS + Supabase, offline-sync) | Cloud / Full-stack | Live on AWS ap-south-1 |
| Tune Buddy AI Chatbot | GenAI / LLM | Live deployment (Viswam AI) |
| Chess Buddy (Stockfish engine) | AI / Games | Live on Streamlit Cloud |

## Run locally

No build needed — serve the folder with any static server:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:8000.

## Structure

```
index.html            # single-page site
assets/css/style.css  # design system + layout
assets/js/three-bg.js # 3D particle background (Three.js)
assets/js/main.js     # nav, typing, filters, tilt, contact form
assets/images/        # photos & project covers
assets/images/work/   # client-work screenshots & covers
```

## Contact

- 📧 umarfaaruk154246@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/mahmmed-umar-faaruk-15a04626a/)
- 🐙 [GitHub](https://github.com/Umarfaaruk)
