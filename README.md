# Full-Stack Next.js Chat & Blog Application

This is a full-stack web application built with **Next.js 15** using the **App Router** architecture, written in **TypeScript**. It features a real-time chat, a blog with user authentication, and a friend system.

## Core Technologies

*   **Framework:** [Next.js](https://nextjs.org/) (v15.5.5) with App Router
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database ORM:** [Prisma](https://www.prisma.io/) connected to a **PostgreSQL** database.
*   **Authentication:** [NextAuth.js (v5)](https://next-auth.js.org/) with `Credentials` provider and `PrismaAdapter`.
*   **Real-time Communication:** [Socket.IO](https://socket.io/) for WebSocket functionality.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
*   **UI Components:** `@heroui/react` component library.
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) for global client-side state.
*   **Schema Validation:** [Zod](https://zod.dev/) for data validation.
*   **Emoji Picker:** `emoji-picker-react` for emoji input in chat.
*   **Theme Management:** `next-themes` for light/dark mode switching.

## Features

### User Management & Authentication
*   **Registration:** Create new user accounts.
*   **Login:** Authenticate users with email and password.
*   **Logout:** Securely end user sessions.
*   **Profile Management:** Users can update their name and avatar.
*   **Password Change:** Securely change account passwords.

### Blog Functionality
*   **Post Creation:** Authenticated users can create new blog posts.
*   **Post Viewing:** View all published posts and individual post details.
*   **Post Editing/Deletion:** Authors can edit or delete their own posts.
*   **Categories:** Posts can be organized by categories.
*   **Reactions:** Users can like/dislike posts.
*   **Search:** Search for posts by title or content.

### Friend System
*   **User Search:** Search for other users by name or email.
*   **Friend Requests:** Send, accept, and reject friend requests.
*   **Friend Management:** Remove friends from the list.

### Real-time Chat
*   **One-on-one Conversations:** Initiate and participate in private chats with friends.
*   **Message Sending/Receiving:** Real-time exchange of text messages.
*   **Message Editing:** Edit sent messages in real-time.
*   **Message Deletion:** Delete sent messages in real-time.
*   **Post Sharing:** Share blog posts directly into chat conversations, rendered as rich cards.
*   **"User is typing..." Indicator:** Real-time feedback when the other user is typing.
*   **Online Status Indicator:** See which friends are currently online.
*   **Emoji Picker:** Easily insert emojis into messages.
*   **Responsive Chat Layout:** Chat interface adapts to different screen sizes, hiding the conversation list on mobile when a chat is active.

### UI/UX
*   **Theme Switching:** Toggle between light and dark modes.
*   **Modal Dialogs:** Used for authentication, post editing, and sharing.

## Architecture

The project follows a feature-driven directory structure within the `src` folder, leveraging Next.js App Router for server-side rendering and Server Actions for data mutations. WebSocket communication is handled by a separate `socket.io` server.

## Setup & Installation

### Prerequisites
*   Node.js (LTS recommended)
*   npm, yarn, or pnpm
*   A running PostgreSQL database instance.

### Steps
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd next-2
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```
3.  **Configure Environment Variables:** Create a `.env.local` file in the project root and add the following:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    NEXTAUTH_SECRET="your-super-secret-key"
    NEXT_PUBLIC_WEBSOCKET_URL="http://YOUR_LOCAL_IP:3001" # Replace YOUR_LOCAL_IP with your machine's IP address
    ```
    *   You can find your local IP address by running `ipconfig` (Windows) or `ifconfig`/`ip addr` (Linux/macOS).
4.  **Apply Database Schema:**
    ```bash
    npx prisma migrate dev --name initial_setup
    ```
    This will synchronize your database schema with the models defined in `prisma/schema.prisma`.
5.  **Seed the database (optional):**
    ```bash
    npm run seed
    ```

## Key Commands

*   **Run the development server (Next.js):**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.
*   **Run the WebSocket server:**
    ```bash
    npm run websockets
    ```
    This must be run in a separate terminal alongside `npm run dev`.
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

*   **Server Actions:** Used for all data mutations and server-side logic.
*   **Data Validation:** All user input is validated using Zod schemas.
*   **Styling:** Tailwind CSS is used for a utility-first approach.
*   **State Management:** Zustand is used for global client-side state.
*   **Server-Side Code:** Modules that should only run on the server are marked with `'server-only'`.

## Future Enhancements

*   **Unread Message Count:** Display the number of unread messages per conversation.
*   **Image/File Sharing:** Allow users to send images and other files in chat.
*   **Push Notifications:** Implement browser push notifications for new messages.
*   **Group Chats:** Extend chat functionality to support group conversations.
*   **User Profiles:** Dedicated user profile pages.
*   **Post Comments:** Add a commenting system to blog posts.
*   **Search Functionality:** Enhance search for users and conversations.

## Screenshots

![pidzhachok](public\5454129332709621511.jpg "Пиджачок)").