# DRP_07 Frontend

This is the Next.js frontend for DRP_07. It currently renders the base “Monday Group” peer-support chat room and talks to the Scala Play backend through `NEXT_PUBLIC_API_URL`.

## Setup

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9000
```

## Commands

```bash
npm run dev      # start local development on http://localhost:3000
npm run build    # build for production
npm run start    # serve the production build
npm run lint     # run ESLint
```

## Current screen

The main page at `app/page.tsx`:

- loads group metadata from `GET /groups/1`
- loads participants from `GET /groups/1/participants`
- loads messages from `GET /groups/1/messages`
- sends group messages with `POST /groups/1/messages`

The “Description”, “Exit”, “Directly message them here”, and “Step into a quiet space to reflect” controls are visible placeholders for later slices.

See the root `README.md` for the full repository workflow, backend setup, API routes, and deployment notes.
