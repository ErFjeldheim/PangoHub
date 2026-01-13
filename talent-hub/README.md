# Talent Hub

Talent Hub is a comprehensive platform for managing consultants, projects, and departments. It provides a centralized system for tracking consultant availability, skills, and project assignments. The platform is designed to streamline the process of finding the right talent for projects and managing department resources effectively.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.io/) (PostgreSQL)
- **Authentication**: [Supabase Auth](https://supabase.io/docs/guides/auth)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Linting**: [ESLint](https://eslint.org/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v20 or later)
- npm, yarn, or pnpm
- Docker (for running Supabase locally)

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

3. **Set up environment variables:**

   Create a `.env.local` file in the root of the project and add the following environment variables:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   You can get these from your Supabase project settings.

4. **Set up Supabase for Local Development:**

   The project is configured to work with the Supabase CLI for local development.

   First, start the local Supabase services:

   ```bash
   npx supabase start
   ```

   This will start the local Supabase stack using Docker. Once it's running, the CLI will output your local Supabase URL and anon key. Use these values for the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` file.

   Next, apply the database migrations:

   ```bash
   npx supabase db reset
   ```

   This command will reset your local database and apply all migrations from `supabase/migrations` and run the seed script.

### Running the Application

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
  - `(auth)/`: Authentication-related pages (login, signup, etc.).
  - `(dashboard)/`: The main dashboard layout and pages.
  - `api/`: API routes.
  - `components/`: Shared React components.
  - `lib/`: Utility functions and libraries.
  - `types/`: TypeScript type definitions.
- `public/`: Static assets.
- `supabase/`: Supabase configuration and migrations.

## Database

The project uses Supabase as the backend, which includes a PostgreSQL database, authentication, and storage.

- **Migrations**: Database schema changes are managed through migration files in the `supabase/migrations` directory. To create a new migration, use the Supabase CLI: `npx supabase migration new <migration_name>`.
- **Seeding**: The `supabase/seed.sql` file contains initial data for the database.
- **Types**: Database types are generated using the Supabase CLI and stored in `types/supabase.ts`. To update the types, run: `npm run types:db`.

## Linting and Code Style

The project uses ESLint for linting and code style enforcement. The configuration is in the `.eslintrc.json` file.

To run the linter:

```bash
npm run lint
```

## Deployment

The application is ready to be deployed on [Vercel](https://vercel.com/), the platform from the creators of Next.js.

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/deployment).
