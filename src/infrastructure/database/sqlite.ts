import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'notes.db';

export const getDb = async () => {
    return await SQLite.openDatabaseAsync(DATABASE_NAME);
};

export const initDb = async () => {
    const db = await getDb();

    await db.execAsync('PRAGMA foreign_keys = ON;');

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'note',
      reminder_at INTEGER,
      is_pinned INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

    // Simple migration for new columns
    try {
        const tableInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(notes);');
        const cols = tableInfo.map((c) => c.name);

        if (!cols.includes('type')) {
            await db.execAsync("ALTER TABLE notes ADD COLUMN type TEXT DEFAULT 'note';");
        }
        if (!cols.includes('reminder_at')) {
            await db.execAsync('ALTER TABLE notes ADD COLUMN reminder_at INTEGER;');
        }
        if (!cols.includes('is_pinned')) {
            await db.execAsync('ALTER TABLE notes ADD COLUMN is_pinned INTEGER DEFAULT 0;');
        }
    } catch (err) {
        console.error('Migration failed:', err);
    }

    await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
  `);

    try {
        // Force rebuild of search table as requested
        await db.execAsync('DROP TABLE IF EXISTS notes_search;');

        // Create the search table with external content
        await db.execAsync(`
      CREATE VIRTUAL TABLE IF NOT EXISTS notes_search USING fts5(
        id,
        title,
        content,
        content='notes',
        content_rowid='rowid'
      );
    `);

        // Sync triggers
        await db.execAsync(`
      DROP TRIGGER IF EXISTS notes_ai;
      DROP TRIGGER IF EXISTS notes_ad;
      DROP TRIGGER IF EXISTS notes_au;
      
      CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
        INSERT INTO notes_search(rowid, id, title, content) VALUES (new.rowid, new.id, new.title, new.content);
      END;
      
      CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
        INSERT INTO notes_search(notes_search, rowid, id, title, content) VALUES('delete', old.rowid, old.id, old.title, old.content);
      END;
      
      CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
        INSERT INTO notes_search(notes_search, rowid, id, title, content) VALUES('delete', old.rowid, old.id, old.title, old.content);
        INSERT INTO notes_search(rowid, id, title, content) VALUES (new.rowid, new.id, new.title, new.content);
      END;
    `);

        // Rebuild FTS5 index to ensure it is in sync with existing data
        await db.execAsync("INSERT INTO notes_search(notes_search) VALUES('rebuild');");
        console.log('Database and FTS5 initialized successfully');
    } catch (error) {
        console.error('Error initializing SQLite:', error);
    }
};
