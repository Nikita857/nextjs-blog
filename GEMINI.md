# GEMINI Project Context

This document provides a comprehensive overview of the Next.js project to guide future development and analysis.

## Project Overview

This is a full-stack web application built with **Next.js 15** using the **App Router** architecture. The project is written in **TypeScript**.

### Core Technologies

*   **Framework:** [Next.js](https://nextjs.org/) (v15.5.5)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database ORM:** [Prisma](https://www.prisma.io/) connected to a **PostgreSQL** database. The schema is defined in `prisma/schema.prisma` and includes models for `User`, `Account`, `Session`, and `VerificationToken`.
*   **Authentication:** [NextAuth.js (v5)](https://next-auth.js.org/) is used for handling authentication. It is configured with a `Credentials` provider for email and password login, using the `PrismaAdapter` to connect to the database.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) is used for styling, configured via `postcss.config.mjs`.
*   **UI Components:** The project utilizes the `@heroui/react` component library and its related packages for UI elements like forms, modals, and navigation bars.
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) is used for global client-side state management.
*   **Schema Validation:** [Zod](https://zod.dev/) is used for data validation, particularly for form inputs as seen in `src/schema/zod.ts`.
*   **Linting:** [ESLint](https://eslint.org/) is configured for code quality and consistency.

### Architecture

The project follows a feature-driven directory structure within the `src` folder:

*   `src/app`: Contains the main application routes, layouts, and pages (App Router).
*   `src/actions`: Server-side actions, such as user registration and sign-in.
*   `src/auth`: Configuration for NextAuth.js.
*   `src/components`: Reusable React components, organized into `common` and `UI` subdirectories.
*   `src/config`: Site-wide configuration files.
*   `src/forms`: Form components for user interactions like login and registration.
*   `src/providers`: React context providers for wrapping the application.
*   `src/schema`: Zod validation schemas.
*   `src/store`: Zustand state management stores.
*   `src/utils`: Utility functions, including database helpers and password utilities.

## Building and Running

### Prerequisites

*   Node.js
*   npm, yarn, or pnpm
*   A running PostgreSQL database instance.

### Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Environment Variables:** Create a `.env.local` file and add the `DATABASE_URL` for your PostgreSQL instance and a `NEXTAUTH_SECRET`.
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    NEXTAUTH_SECRET="your-super-secret-key"
    ```
3.  **Apply Database Schema:**
    ```bash
    npx prisma migrate dev
    ```
    This will synchronize your database schema with the models defined in `prisma/schema.prisma`.

### Key Commands

*   **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

*   **Create a production build:**
    ```bash
    npm run build
    ```

*   **Start the production server:**
    ```bash
    npm run start
    ```

*   **Run the linter:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Authentication:** The authentication flow is handled by NextAuth.js. User actions trigger server actions which then call NextAuth's `signIn` and `signOut` methods. Password hashing is done using `bcryptjs`.
*   **Data Validation:** All user input, especially for authentication and forms, should be validated using the Zod schemas defined in `src/schema`.
*   **Styling:** Adhere to the Tailwind CSS utility-first approach. Custom global styles are in `src/app/globals.css`.
*   **State Management:** Use Zustand for managing global client-side state. For authentication state, refer to `src/store/auth.store.ts`.
*   **Server-Side Code:** Use the `'server-only'` package to mark modules that should only run on the server, preventing them from being accidentally included in the client bundle.
