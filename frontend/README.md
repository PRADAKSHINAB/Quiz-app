# Quiz App Frontend

This is the frontend for the Quiz Application built with **React 18 + Vite**.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000 by default.

## Environment Variables

Create a `.env.local` file in this directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:3000
```

This tells the frontend where to find the backend API.

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production (outputs to `dist/`)
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint
