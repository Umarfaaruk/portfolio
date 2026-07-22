# Umar Faaruk — AI/ML Engineer Portfolio

Futuristic, 3D-animated personal portfolio of **Mahmmed Umar Faaruk** — AI/ML engineer from Hyderabad, India.

**Live site:** https://umarfaaruk.github.io/portfolio/

## Highlights

- 🎨 Light **editorial** design — big **Fraunces** serif display type, generous whitespace, freelance-first layout
- 🌌 Three.js **r160 (ES modules + import maps)** background — particle field that morphs into 7 formations as you scroll (sphere → galaxy → DNA helix → grid → torus knot → cube lattice → vortex), recolored for light theme, with neural synapse lines and cursor-repulsion physics
- 🧩 Services section with a scroll-driven progress line + numbered client-work case-study rows
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
| [EduOnx](https://eduonx.in) — AI learning platform | Freelance / EdTech | Live client site on custom domain |
| [Jobly](https://jobly-pearl.vercel.app) — ATS resumes & job matching | Freelance / AI product | Live |
| [Café Spice](https://qr-table-ordering-system.vercel.app), [Bazaar Premier](https://bazaar-premier.vercel.app), [Founder & Growth](https://founder-growth-website.vercel.app), [Aerowash](https://aerowash-lac.vercel.app), [Aura Villa](https://villa-demo-lemon.vercel.app) | Freelance / web | Live client & concept sites |
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
```

## Contact

- 📧 umarfaaruk154246@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/mahmmed-umar-faaruk-15a04626a/)
- 🐙 [GitHub](https://github.com/Umarfaaruk)
