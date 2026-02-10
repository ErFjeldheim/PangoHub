# Talent Hub

Talent Hub is a comprehensive platform for managing consultants, projects, and departments. It provides a centralized system for tracking consultant availability, skills, and project assignments. The platform is designed to streamline the process of finding the right talent for projects and managing department resources effectively.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PocketBase](https://pocketbase.io/)
- **Authentication**: PocketBase Auth
- **UI**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Linting**: [ESLint](https://eslint.org/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v20 or later)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/talent-hub.git
   cd talent-hub
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configuration:**

   The project is currently configured to connect to the remote PocketBase instance at `https://db.pangohub.fjelldata.com`.
   
   If you need to customize this, check `lib/pocketbase.ts` and `lib/pocketbase-server.ts`.

4. **Running the Application:**

   To run the application in development mode:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows a standard Next.js `app` directory structure.

- `app/`: Contains all the routes, UI, and business logic.
  - `actions/`: Server Actions for data mutations and fetching.
  - `(auth)/`: Authentication-related pages (login, signup, etc.).
  - `dashboard/`: The main dashboard layout and pages.
  - `api/`: API routes.
- `components/`: Shared React components.
- `lib/`: Utility functions and libraries (including PocketBase client setup).
- `types/`: TypeScript type definitions (including PocketBase schema types).
- `public/`: Static assets.

## Database

The project uses PocketBase as the backend.

- **Schema**: The database schema (collections, fields, API rules) is managed within PocketBase.
- **Types**: TypeScript definitions for the database schema are located in `types/pocketbase.ts`.

## Linting and Code Style

The project uses ESLint for linting and code style enforcement.

To run the linter:

```bash
npm run lint
```

## Deployment

The application is ready to be deployed on [Vercel](https://vercel.com/), the platform from the creators of Next.js.

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/deployment).
