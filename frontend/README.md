# DRP_07 Frontend

This is the Next.js frontend for DRP_07. It provides the current support request interface and talks to the Scala Play backend through `NEXT_PUBLIC_API_URL`.

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

See the root `README.md` for the full repository workflow, backend setup, API routes, and deployment notes.
