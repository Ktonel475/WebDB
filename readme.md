# WebDB Projects API

A robust starter template for building a Node.js API with Prisma and PostgreSQL. Use this as a foundation for RESTful or GraphQL APIs, with modular support for projects, users, papers, events, and media.

---

## 🚀 Features

- Node.js + Express API
- PostgreSQL database
- Prisma ORM for modeling and migrations
- Seed data support
- Modular structure (projects, users, papers, events, media)
- Docker support for easy deployment

---

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/)  (recommended for quick setup)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) (optional if not using Docker)

---

## ⚡ Quick Start

### Option 1: Docker Setup (Recommended)

1. **Ensure Docker is installed and running.**
2. **Create a `.env` file** (copy from `.env.example`):

   ```env
   DATABASE_URL="postgresql://dev:dev@db:5432/appdb?schema=public"
   ```
3. **Start containers:**

   ```sh
   docker-compose up -d
   ```

   This launches PostgreSQL and the Node.js API.
4. **Run migrations and seed data:**

   ```sh
   npx prisma migrate dev --name init
   npm run seed
   ```
5. **Start the server:**

   ```sh
   npm run dev
   ```

   - API: [http://localhost:4000](http://localhost:4000)
   - PostgreSQL: `localhost:5432` (see `.env` for credentials)

---

### Option 2: Local Setup (Node.js + PostgreSQL)

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. **Install dependencies:**

   ```sh
   npm install
   ```
3. **Configure environment variables:**

   Create a `.env` file in the root directory (see `.env.example`):

   ```env
   DATABASE_URL="postgresql://dev:dev@localhost:5432/appdb?schema=public"
   ```
4. **Set up the database:**

   - Ensure PostgreSQL is running.
   - Create the database if needed:

     ```sql
     CREATE DATABASE appdb;
     ```
   - Run Prisma migrations:

     ```sh
     npx prisma migrate dev --name init
     ```
5. **Seed the database:**

   ```sh
   npm run seed
   ```
6. **Start the server:**

   ```sh
   npm run dev
   ```

   - API: [http://localhost:4000](http://localhost:4000)

---

## 🧩 Usage & Structure

- Add new routes in `src/routes/`
- Add controllers in `src/controllers/`
- Use Prisma Client for DB operations (`import { prisma } from './prisma/client'`)
- Seed or modify sample data in `prisma/seed.js`
- Extend models in `prisma/schema.prisma` and run migrations

---

## 📚 Example Endpoints

- `GET /users` — List all users
- `POST /users` — Create a new user
- `GET /projects` — List all projects
- `POST /projects` — Create a new project

---

## 📝 Notes

- Always run `npx prisma generate` after modifying `schema.prisma`.
- Use `.env` to keep sensitive information secure.
- The seed script is optional but recommended for initial data.

---

## 📦 Docker & Deployment

If you need a ready-to-use `docker-compose.yml` and `Dockerfile`, let us know!
