# Nozi Manga

Nozi Manga is a premium manga reader built with Next.js (Frontend) and Node.js/Express (Backend). It features a dense, highly responsive portal-style UI (inspired by TruyenQQ) and integrates with the MangaDex API using a resilient backend connection.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- **MySQL Database** (You can use XAMPP or a standalone MySQL server)
- Git

## 1. Backend Setup

The backend manages database caching, slug routing, and API connections to MangaDex.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the `backend` directory (if not already present) based on `.env.example`. Make sure you have your MySQL connection string configured:
   ```env
   PORT=5000
   DATABASE_URL="mysql://root:@localhost:3306/nozi_manga"
   ```
   *(Note: Ensure your MySQL server (e.g. XAMPP Apache + MySQL) is running)*

4. **Initialize Database:**
   Generate the Prisma Client and push the schema to your database.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   The backend will be running on `http://localhost:5000`.

## 2. Frontend Setup

The frontend provides a fast, responsive user interface built with Next.js.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the `frontend` directory indicating where the backend API lives:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```

## 3. Running the Application
Once both servers are running, access the web app by visiting:
**[http://localhost:3000](http://localhost:3000)** in your browser.

## Technologies Used
* **Frontend:** Next.js (App Router), React, CSS Modules
* **Backend:** Node.js, Express, Axios
* **Database:** PostgreSQL/MySQL via Prisma ORM
* **Data Source:** MangaDex API
