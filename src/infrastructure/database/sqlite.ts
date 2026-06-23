import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'notes.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbInstance;
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
      audio_uri TEXT,
      images TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

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
    if (!cols.includes('audio_uri')) {
      await db.execAsync('ALTER TABLE notes ADD COLUMN audio_uri TEXT;');
    }
    if (!cols.includes('images')) {
      await db.execAsync('ALTER TABLE notes ADD COLUMN images TEXT;');
    }
  } catch (err) {
    console.log('Migration failed:', err);
  }

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
  `);

  try {
    const searchTableExists = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notes_search';"
    );

    if (!searchTableExists) {
      console.log('notes_search table does not exist. Creating it...');
      await db.execAsync(`
        CREATE VIRTUAL TABLE notes_search USING fts5(
          id,
          title,
          content,
          content='notes',
          content_rowid='rowid'
        );
      `);

      await db.execAsync(`
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

      await db.execAsync("INSERT INTO notes_search(notes_search) VALUES('rebuild');");
      console.log('FTS5 search table and triggers created and rebuilt successfully.');
    } else {
      await db.execAsync(`
        CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
          INSERT INTO notes_search(rowid, id, title, content) VALUES (new.rowid, new.id, new.title, new.content);
        END;
        
        CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
          INSERT INTO notes_search(notes_search, rowid, id, title, content) VALUES('delete', old.rowid, old.id, old.title, old.content);
        END;
        
        CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
          INSERT INTO notes_search(notes_search, rowid, id, title, content) VALUES('delete', old.rowid, old.id, old.title, old.content);
          INSERT INTO notes_search(rowid, id, title, content) VALUES (new.rowid, new.id, new.title, new.content);
        END;
      `);
    }
    console.log('Database and FTS5 initialized successfully');
  } catch (error) {
    console.log('Error initializing SQLite:', error);
  }
};
