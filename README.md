# Quiz App (Full Stack)

Full-stack quiz application with a React.js frontend and an Express + MongoDB backend. Users can browse topics, take quizzes, create quizzes, and track progress.

## Tech Stack

- Frontend: React 18, Vite, React Router DOM, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth

## Project Structure

- `frontend/`: React app (UI + styling) — built with Vite
- `backend/`: Express API server + MongoDB models/seed data
- `run-dev.js`: Starts backend and frontend together

## Prerequisites

- Node.js 18+ recommended
- MongoDB running locally (or a MongoDB connection string)

## Setup

Install dependencies for root + frontend + backend:

```bash
npm run install-all
```

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env`:

```bash
MONGODB_URI=mongodb://localhost:27017/Quiz_app
MONGODB_DB=Quiz_app
PORT=5000
JWT_SECRET=replace-with-a-strong-secret
```

### Frontend (`frontend/.env.local`)

Create `frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:3000
```

## Run (Development)

From the project root:

```bash
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000` (API under `/api`)

## Useful Scripts

From the project root:

- `npm start`: Run backend + frontend together
- `npm run backend`: Run backend only
- `npm run frontend`: Run frontend only

From `frontend/`:

- `npm run dev`: Vite dev server
- `npm run build`: Production build
- `npm run preview`: Preview production build locally
- `npm run lint`: Lint

From `backend/`:

- `npm run dev`: Start backend with nodemon
- `npm start`: Start backend
