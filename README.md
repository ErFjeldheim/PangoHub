# PangoHub

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript&logoColor=white)
![PocketBase](https://img.shields.io/badge/PocketBase-0.26-orange?style=flat-square&logo=pocketbase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![Status](https://img.shields.io/website?url=https%3A%2F%2Fpangohub.pangoconsulting.no&style=flat-square&label=PangoHub)

PangoHub (formerly Talent Hub) is a comprehensive platform for managing consultants, projects, and departments. It serves as a centralized system for tracking consultant availability, skills, and project assignments, designed to streamline resource management and talent matching.

The application is currently hosted on **Dokploy** at [pangohub.pangoconsulting.no](https://pangohub.pangoconsulting.no).

## ✨ Features

-   **Consultant Management**: Detailed profiles with bio, skills, experience, and education.
-   **Availability Tracking**: Monthly availability status (Available, Busy, Partly, Unavailable) and hour tracking.
-   **Search & Filtering**: Real-time search for consultants by name, skills, or department.
-   **Internationalization (i18n)**: Full support for Norwegian (Bokmål) and English.
-   **Department Views**: Aggregated views for department resource planning.
-   **Responsive UI**: Modern, accessible interface built with Shadcn UI and Tailwind CSS 4.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database & Auth**: [PocketBase](https://pocketbase.io/)
-   **UI Library**: [React 19](https://reactjs.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Deployment**: Docker / Nixpacks on [Dokploy](https://dokploy.com/)

## 🚀 Getting Started

Follow these instructions to get a local copy running for development.

### Prerequisites

-   Node.js (v20 or later)
-   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/pangohub.git
    cd pangohub
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**

    The project connects to a remote PocketBase instance. Ensure you have the correct credentials or environment variables if required (check `lib/pocketbase.ts` or `.env.example`).

4.  **Run Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
├── app/                # Next.js App Router (pages & API)
│   ├── actions/        # Server Actions (Data mutations/fetching)
│   ├── (auth)/         # Authentication routes
│   ├── dashboard/      # Main application routes
│   └── api/            # API endpoints
├── components/         # React components
│   ├── ui/             # Shadcn UI primitives
│   └── consultants/    # Feature-specific components
├── lib/                # Utilities & Config
│   ├── pocketbase.ts   # PocketBase client
│   └── i18n/           # Translation context & strings
├── types/              # TypeScript definitions
└── public/             # Static assets
```

## 🗄️ Database

The project uses **PocketBase** for the backend (Database, Auth, Storage).
Key collections include:
-   `users`: Consultant profiles (extended from auth).
-   `availability_months`: Monthly capacity and status tracking.
-   `experiences`, `educations`, `profile_skills`: Related profile data.
-   `departments`, `projects`: Organizational data.

## 🚢 Deployment

The application is deployed using **Dokploy** with **Nixpacks**.

-   **Production URL**: [https://pangohub.fjelldata.com](https://pangohub.fjelldata.com)
-   **Build Command**: `npm run build`
-   **Start Command**: `npm start`

## 📜 License

Private repository. All rights reserved.
