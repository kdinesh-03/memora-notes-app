# Memora

A privacy-first notes and reminders app built with React Native (Expo) and Supabase. Notes are encrypted end-to-end with AES-256-CTR both locally and in the cloud.

## Features

- **Notes & Reminders** — Create text notes with optional reminder dates and times
- **End-to-End Encryption** — All note content is encrypted with AES-256-CTR before storage; encryption keys never leave the device
- **Offline-First** — Notes are saved locally to SQLite first, then synced asynchronously to the cloud
- **Cloud Sync** — When signed in and online, every create/update/delete/pin/lock/unlock/reorder automatically syncs with Supabase
- **Conflict Resolution** — Last-writer-wins based on `updated_at` timestamps
- **Drag-to-Reorder** — Long-press and drag notes to reorder; order persists across devices via sync
- **Pin Notes** — Pin important notes to the top of the list
- **Per-Note PIN Lock** — Lock individual notes behind a 4-digit PIN
- **App Lock** — Lock the entire app with device biometrics or a PIN
- **Audio Notes** — Record and attach audio to notes
- **Image Attachments** — Attach images to notes
- **Full-Text Search** — Search across all note titles and content (client-side, due to encryption)
- **Dark Mode** — System-following light/dark theme
- **Tab Views** — Filter notes by All, Pinned, Notes, Reminders, or Locked
- **Notifications** — Local notifications for reminder notes

## Tech Stack

| Layer         | Technology                         |
| ------------  | ---------------------------------- |
| Framework     | React Native + Expo 56             |
| Language      | TypeScript                         |
| Routing       | Expo Router (file-based)           |
| State         | Zustand                            |
| Local DB      | SQLite via expo-sqlite             |
| Remote DB     | Supabase (PostgreSQL)              |
| Auth          | Supabase Auth (email/password)     |
| Encryption    | AES-256-CTR (expo-crypto + aes-js) |
| Secure Store  | expo-secure-store                  |
| Sync Engine   | Custom push/pull with sync queue   |
| Audio         | expo-audio                         |
| Images        | expo-image-picker                  |
| Notifications | expo-notifications                 |

## Architecture

```
src/
├── app/                          # Expo Router pages
├── features/
│   ├── data/
│   │   ├── datasource/           # SQLite CRUD, Supabase API, sync queue
│   │   └── repository/           # Repository pattern wrapping datasource + sync queue
│   ├── domain/
│   │   ├── entities/             # Note interface, DTOs
│   │   └── usecases/             # Thin use case wrappers
│   └── presentation/
│       ├── components/           # UI components (list items, modals, etc.)
│       ├── context/              # Toast provider
│       ├── hooks/                # useNotes, useNoteEditor, useLockNote, etc.
│       ├── screens/              # Screen components
│       └── styles/               # Stylesheets
├── infrastructure/
│   ├── database/sqlite.ts        # SQLite init, migrations, FTS5
│   ├── encryption/               # AES-256-CTR encrypt/decrypt
│   ├── secure-store/             # expo-secure-store wrapper
│   ├── supabase/                 # Supabase client + storage
│   └── sync/
│       ├── deviceId.ts           # Persistent device ID generation
│       └── syncEngine.ts         # Push/pull sync + conflict resolution
└── shared/
    ├── hooks/                    # Shared hooks (useNetworkStatus)
    ├── services/                 # Notifications, sync trigger
    ├── store/                    # Zustand stores (auth, notes, theme, etc.)
    ├── theme/                    # Colors, light/dark palettes
    └── utils/                    # Fonts, helpers
```

## Data Flow

1. All mutations go through use cases → repository → datasource
2. Repository automatically writes to SQLite and adds a pending entry to the sync queue
3. After each mutation, `triggerSyncIfAvailable()` checks if the user is authenticated and online
4. If conditions are met, `startSync()` is called which:
   - **Push**: Uploads local pending changes to Supabase (files first, then note data)
   - **Pull**: Fetches remote changes, decrypts, and merges with conflict resolution (latest `updated_at` wins)
5. Sync status is surfaced in the UI with a badge indicator

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- A Supabase project

### Environment Variables

Create a `.env` file in the root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database

Run the schema in `supabase_schema.sql` in your Supabase SQL editor to create the `notes` table and Row Level Security policies.

### Install & Run

```bash
npm install
npx expo start
```
