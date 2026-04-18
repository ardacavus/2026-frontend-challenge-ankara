# Missing Podo: The Ankara Case

An investigation dashboard built for the **Jotform 2026 Frontend Challenge**. The app aggregates cross-source Jotform submissions — check-ins, messages, sightings, personal notes, and anonymous tips — into a single, interactive investigation workspace to help users trace Podo's last known movements and surface suspicious patterns.

---

## Running the project

**Prerequisites:** Node.js 18 or higher

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
cp .env.example .env
# (or create .env manually — see Environment Variables below)

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview   # serve the built output locally
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_JOTFORM_API_KEY=363d4fa1af679bc6a1fce4cff42e0a9d

VITE_FORM_CHECKINS=261065067494966
VITE_FORM_MESSAGES=261065765723966
VITE_FORM_SIGHTINGS=261065244786967
VITE_FORM_NOTES=261065509008958
VITE_FORM_TIPS=261065875889981
```

---

## Features

### Core
| Feature | Details |
|---|---|
| **Data fetching** | Parallel fetch from 5 Jotform forms via the REST API; unified `InvestigationRecord` model |
| **Investigation UI** | 3-panel dashboard — filter sidebar, record list, detail/summary panel |
| **Search & Filter** | Full-text search + source type, person, and location filters with active-filter tags |
| **Detail view** | Record metadata, linked records by confidence level (high / possible / weak), prev/next navigation |
| **Record linking** | Weighted scoring engine: exact name match, Podo co-occurrence, same location, time proximity, name similarity |
| **State handling** | Skeleton loading screen, error card with retry, empty states for all views |

### Bonus
| Bonus | Details |
|---|---|
| **Map view** | Leaflet map with static Ankara coordinates; coloured markers per source type; marker ↔ detail panel sync |
| **Podo Timeline** | Chronological chain of all Podo-linked events with time-gap labels |
| **Summary panel** | Suspicion ranking with score bars, last-seen-with card, location frequency, high-risk tips |
| **Person matching** | Alias normalisation (`Kagan` / `Kağan A.` → `Kağan`), Turkish title-case |
| **Responsive design** | Desktop 3-column / tablet 2-column / mobile slide-over sidebar |
| **Map + list sync** | Single `selectedRecord` state drives list highlight, map marker pulse, and detail panel simultaneously |

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite 8**
- **react-leaflet** + **Leaflet** (map)
- Plain CSS with CSS custom properties (no UI library)

---

## Project structure

```
src/
├── components/       # UI components (Header, RecordCard, DetailPanel, MapView, …)
├── pages/            # InvestigationPage — top-level layout and state wiring
├── hooks/            # useInvestigation — all data fetching + filter state
├── services/         # Jotform API fetch functions
├── utils/
│   ├── normalize.ts  # Name aliases, location canonicalisation, timestamp parsing
│   ├── transformers.ts # Form-specific → InvestigationRecord converters
│   ├── linking.ts    # Weighted record-linking scoring engine
│   └── suspicion.ts  # Per-person suspicion scoring and investigation summary
├── types/            # Shared TypeScript interfaces
└── constants/        # API key, base URL, form IDs
```
