# Notes & Labels Manager

A full-stack web app to create and organize notes with a flexible labeling system.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (pg)
- **Frontend:** Next.js, TailwindCSS, TypeScript

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/krishnammu11/Notes-app.git
cd Notes-app

### 2. Database Setup
Create a PostgreSQL database called `notes_db` then run in pgAdmin Query Tool:

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS notes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), title VARCHAR(255) NOT NULL, content TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS labels (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name VARCHAR(100) NOT NULL UNIQUE, color VARCHAR(7) NOT NULL DEFAULT '#6366f1', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS note_labels (note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE, label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE, PRIMARY KEY (note_id, label_id));

### 3. Backend Setup
cd backend
npm install

Create .env file:
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=notes_db
PORT=5000

Run:
npm run dev

### 4. Frontend Setup
cd frontend
npm install

Create .env.local file:
NEXT_PUBLIC_API_URL=http://localhost:5000

Run:
npm run dev

Open http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notes | Get all notes |
| GET | /notes?labelIds=id | Filter notes by labels |
| POST | /notes | Create note |
| PUT | /notes/:id | Update note |
| DELETE | /notes/:id | Delete note |
| PATCH | /notes/:id/labels/:labelId | Add label to note |
| DELETE | /notes/:id/labels/:labelId | Remove label from note |
| GET | /labels | Get all labels |
| POST | /labels | Create label |
| PUT | /labels/:id | Update label |
| DELETE | /labels/:id | Delete label |

## Environment Variables

Backend (.env):
- DB_HOST - PostgreSQL host
- DB_PORT - PostgreSQL port
- DB_USERNAME - PostgreSQL username
- DB_PASSWORD - PostgreSQL password
- DB_NAME - Database name
- PORT - Server port (default 5000)

Frontend (.env.local):
- NEXT_PUBLIC_API_URL - Backend API URL