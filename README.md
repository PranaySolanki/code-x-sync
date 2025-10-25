# CodeXSync: Real-Time Collaborative Code Editor 💻

CodeXSync is a full-stack, web-based development environment that enables multiple users to collaborate and code simultaneously in the same file with instant synchronization. Built with Next.js and Supabase Realtime, this project demonstrates expertise in operational transformation principles and scalable real-time state management.

## ✨ Features

  * **Real-Time Key-to-Key Sync:** Utilizes an **Operational Transformation (OT)**-like approach by transmitting minimal content patches directly from the Monaco Editor model across the network. This eliminates typing lag and prevents conflicts during simultaneous editing.
  * **Initial State Consistency:** Implements a custom **Request/Response pattern** via **Supabase Broadcast** to ensure users who join or reload the page receive the absolute latest, unsaved code from active collaborators, prioritizing live work over static database records.
  * **Multi-Cursor Tracking:** Tracks and broadcasts collaborators' cursor positions for a true shared editing experience.
  * **Authentication & Authorization:** Secure user access control using Supabase Auth to ensure only authorized owners and team members can view or edit project files.
  * **File Persistence:** Code is saved to a PostgreSQL database (via Supabase) upon explicit user action ("Save Code" button).
  * **Code Execution:** Integrated API for running code in popular languages (Python, JavaScript, C, Java) and displaying output.

## 🚀 Key Technologies & Architectural Highlights

| Category | Technology | Architectural Highlight |
| :--- | :--- | :--- |
| **Frontend** | **React / Next.js** | Client-side rendering and routing for a smooth editor experience. |
| **Editor** | **Monaco Editor** | The core code editor component; custom event listeners replaced default `onChange`. |
| **Real-Time Layer**| **Supabase Realtime (Broadcast)** | Used as the WebSocket backbone to deliver ephemeral (non-persistent) patches and cursor data instantly across clients. |
| **Persistence** | **Supabase (Postgres)**| The source of truth for user data, file content, and project metadata. |
| **Conflict Resolution**| **Monaco's `applyEdits`** | Used to apply remote code patches, effectively managing low-latency conflict resolution without complex manual OT logic. |
| **Tooling** | `useRef`, `useEffect` | Crucial React Hooks used to manage component lifecycle, suppress self-broadcasts, and prevent infinite update loops. |

## ⚙️ Setup and Installation

Follow these steps to get CodeXSync running locally:

### 1\. Prerequisites

You must have Node.js (version 18+) and npm installed.

### 2\. Clone the Repository

```bash
git clone [YOUR_REPOSITORY_URL]
cd code-x-sync
```

### 3\. Install Dependencies

```bash
npm install
```

### 4\. Supabase Setup

You need a Supabase project set up.

1.  **Database:** Create the necessary tables (`File-Table`, `Project-Table`, etc.) in your Supabase database.

2.  **Realtime:** Go to **Realtime** in the dashboard and ensure Realtime is enabled for the `public` schema.

3.  **Environment Variables:** Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    # .env.local
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

### 5\. Running the Application

To enable network access for collaboration testing, start the server:

```bash
npm run dev 
```

The application will be available at `http://localhost:3000` and on your local network at `http://[YOUR_IP_ADDRESS]:3000`.

## 🤝 How to Test Collaboration

1.  Open **two different browser windows/devices** and navigate to the same project file URL (e.g., `/editor/[fileId]`).
2.  Start typing in one window. The patches will be applied instantly in the second window.
3.  **Test Initial Sync:** Close one browser window, make a change in the active window, and immediately reload the closed window. The reloading client will ask the active client for the live code, ensuring it loads the unsaved state, maintaining consistency.
