# LinkPulse landing page (React + Vite + GSAP + Three.js)
```
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```
## Status
- Real: nav, mobile menu, anchors, GSAP/ScrollTrigger scroll-drawn journey, 3D hero (lazy, pauses off-screen, CSS fallback, reduced-motion), demo tabs, URL/alias validation, FAQ accordion.
- Needs backend: copy `.env.example` to `.env`. `VITE_API_URL` enables `POST /api/links {destination, alias} -> {shortUrl}`. Without it, the form validates only and says nothing was created.
- Sample-only (labelled on page): analytics charts, rules preview. `VITE_APP_URL` sets Sign in / Get started target (defaults to `#demo`).
- Not built: QR, bulk import and admin screens (described as product scope only).
