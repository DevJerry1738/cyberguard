import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DraftResponses } from '../schemas/draft';

interface CyberGuardDraftDB extends DBSchema {
  drafts: {
    key: string; // sessionId
    value: {
      sessionId: string;
      responses: DraftResponses;
      currentDomain: string | null;
      currentQuestion: string | null;
      version: number;
      lastSavedAt: string;
      updatedAt: string;
    };
  };
  syncQueue: {
    key: number; // auto increment id
    value: {
      id?: number;
      sessionId: string;
      responses: DraftResponses;
      currentDomain: string | null;
      currentQuestion: string | null;
      version: number;
      timestamp: string;
    };
  };
}

const DB_NAME = 'CyberGuardAssessmentDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CyberGuardDraftDB>> | null = null;

function getDB(): Promise<IDBPDatabase<CyberGuardDraftDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in browser environment'));
  }

  if (!dbPromise) {
    dbPromise = openDB<CyberGuardDraftDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'sessionId' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  return dbPromise;
}

export async function saveLocalDraft(data: {
  sessionId: string;
  responses: DraftResponses;
  currentDomain?: string | null;
  currentQuestion?: string | null;
  version: number;
  lastSavedAt?: string;
}): Promise<void> {
  try {
    const db = await getDB();
    const now = new Date().toISOString();
    await db.put('drafts', {
      sessionId: data.sessionId,
      responses: data.responses,
      currentDomain: data.currentDomain ?? null,
      currentQuestion: data.currentQuestion ?? null,
      version: data.version,
      lastSavedAt: data.lastSavedAt ?? now,
      updatedAt: now,
    });
  } catch (err) {
    console.error('Failed to save draft to IndexedDB:', err);
  }
}

export async function getLocalDraft(sessionId: string) {
  try {
    const db = await getDB();
    return await db.get('drafts', sessionId);
  } catch (err) {
    console.error('Failed to get draft from IndexedDB:', err);
    return null;
  }
}

export async function deleteLocalDraft(sessionId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('drafts', sessionId);
  } catch (err) {
    console.error('Failed to delete local draft from IndexedDB:', err);
  }
}

export async function enqueueOfflineSync(data: {
  sessionId: string;
  responses: DraftResponses;
  currentDomain?: string | null;
  currentQuestion?: string | null;
  version: number;
}): Promise<void> {
  try {
    const db = await getDB();
    await db.add('syncQueue', {
      sessionId: data.sessionId,
      responses: data.responses,
      currentDomain: data.currentDomain ?? null,
      currentQuestion: data.currentQuestion ?? null,
      version: data.version,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to enqueue offline sync task:', err);
  }
}

export async function getSyncQueueItems(sessionId?: string) {
  try {
    const db = await getDB();
    const all = await db.getAll('syncQueue');
    if (sessionId) {
      return all.filter(item => item.sessionId === sessionId);
    }
    return all;
  } catch (err) {
    console.error('Failed to get sync queue:', err);
    return [];
  }
}

export async function clearSyncQueueItem(id: number): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('syncQueue', id);
  } catch (err) {
    console.error('Failed to clear sync queue item:', err);
  }
}

export async function clearAllSyncQueue(sessionId?: string): Promise<void> {
  try {
    const db = await getDB();
    if (!sessionId) {
      await db.clear('syncQueue');
      return;
    }
    const items = await getSyncQueueItems(sessionId);
    const tx = db.transaction('syncQueue', 'readwrite');
    for (const item of items) {
      if (item.id !== undefined) {
        await tx.store.delete(item.id);
      }
    }
    await tx.done;
  } catch (err) {
    console.error('Failed to clear sync queue for session:', err);
  }
}
