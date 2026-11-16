# PakRoadGuardAI frontend

The officer and administrator web app for PakRoadGuardAI. Edge cameras detect wrong-way driving,
riders without helmets and triple riding; officers review the evidence here before any action is taken.

Built with **React 19 + Vite + React Router + Tailwind CSS 4**. It follows the design in
[`design/PakRoadGuardAI UI.pdf`](design/PakRoadGuardAI%20UI.pdf).

> There is no backend yet. Every page shows **sample data** (marked "sample data" on screen).

## Install and run

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
cd frontend
npm install        # once, downloads the libraries into node_modules/
npm run dev        # starts the app at http://localhost:5173
```

Other commands:

| Command           | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm run build`   | Makes the production version in `dist/`               |
| `npm run preview` | Serves the `dist/` build locally to check it          |

## Signing in

There is no real login yet. On the Sign in page, pick a role under **Sign in as** and press **Sign in**.
The role is remembered in the browser until you press **Sign out** (bottom of the sidebar).

| Role              | Can see                                                      |
| ----------------- | ------------------------------------------------------------ |
| Reviewing officer | Dashboard, Live monitoring, Violations, Reports, Users & roles |
| Administrator     | Everything above, plus **Cameras & zones**                   |

## Pages

| Page                    | Address            | What works                                                                         |
| ----------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| Sign in                 | `/sign-in`         | Choose a role and enter the app                                                    |
| Dashboard               | `/dashboard`       | Totals, violations by hour, by type, vehicle mix, latest alerts, CSV export       |
| Live monitoring         | `/live`            | Switch cameras, detection boxes, live events; CAM-04 shows as offline              |
| Violations review queue | `/violations`      | Filter by type, status, date; search by ID or track number                         |
| Violation detail        | `/violations/:id`  | Evidence, 8-frame strip, play clip, download evidence, request plate access, approve / reject (reject needs a reason), audit trail |
| Cameras & zones         | `/cameras`         | Camera health, drag zone corners, flip a zone's arrow, add zones and counting lines, rule settings, save |
| Reports, Users & roles  | `/reports`, `/users` | Placeholders for later                                                           |

Decisions, zone edits and saved settings are kept in memory only, so they reset when the page is reloaded.

## Folder layout

```
frontend/
├── design/                 the UI design (PDF)
├── public/                 favicon
└── src/
    ├── api/index.js        the ONLY place pages get data from
    ├── data/               sample data (cameras, violations, live feeds, zones, ...)
    ├── auth/               remembers the chosen role, blocks pages by role
    ├── components/         shared pieces: Sidebar, Card, PageHeader, StatusBadge, Button, ...
    ├── hooks/useApi.js     loads data from an api function into a page
    ├── pages/              one file per page, with its parts in a sub-folder
    │   ├── dashboard/  live/  violations/  detail/  cameras/
    ├── utils/              CSV / JSON download helpers
    ├── App.jsx             the routes (which address shows which page)
    ├── main.jsx            starts React
    └── index.css           Tailwind and the design colours and fonts
```

## Connecting the FastAPI backend later

Pages never read `src/data/` directly. They call functions in `src/api/index.js`, such as
`getViolations(filters)` or `decideViolation(id, decision)`. Each function returns a Promise.

To use the real backend, change the body of each function to call the server and keep the same name
and return shape, for example:

```js
export function getViolations(filters) {
  const query = new URLSearchParams(filters)
  return fetch(`/api/violations?${query}`).then((res) => res.json())
}
```

No page needs to change. When the backend is in place, remove the `SampleTag` ("sample data") labels.

## Design notes

- Sizes, spacing and colours were measured from the design screenshots (a 1440 px wide screen) and
  each page was compared side by side with the design.
- Fonts: **Inter** for text and **Space Grotesk** for headings and big numbers. They are installed as
  npm packages, so the app works offline (no Google Fonts request).
- Colours are named once in `src/index.css` (`bg-navy`, `bg-amber`, `bg-sidebar`, ...).
- Where the design could not work as drawn, the app follows the behaviour:
  - The review queue's status filter starts at **Any status**, because the design shows "Pending"
    selected while the table also lists approved and rejected rows.
  - **Cameras & zones** is hidden from the officer's sidebar (administrator only), and officers who
    open `/cameras` are sent to the Dashboard.
  - A small **Sign out** link was added under "Signed in as" so roles can be switched.
