
import { SavedCG, UnlockableCG, GameState, SaveSlot } from "../types";

const DB_NAME = "KizunaEngineDB";
const GALLERY_STORE = "gallery";
const SAVES_STORE = "saves";
const PROMPTS_STORE = "prompts"; // New store
const DB_VERSION = 3; // Incremented version

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error opening database");

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(GALLERY_STORE)) {
        db.createObjectStore(GALLERY_STORE, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(SAVES_STORE)) {
        db.createObjectStore(SAVES_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(PROMPTS_STORE)) {
        const store = db.createObjectStore(PROMPTS_STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
};

// --- Gallery Functions ---

export const saveCGToGallery = async (cg: UnlockableCG, imageData: string, type: 'event' | 'scene' = 'event'): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([GALLERY_STORE], "readwrite");
  const store = transaction.objectStore(GALLERY_STORE);

  const item: SavedCG = {
    ...cg,
    imageData,
    timestamp: Date.now(),
    type
  };

  return new Promise((resolve, reject) => {
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save CG");
  });
};

export const getGallery = async (): Promise<SavedCG[]> => {
  const db = await openDB();
  const transaction = db.transaction([GALLERY_STORE], "readonly");
  const store = transaction.objectStore(GALLERY_STORE);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result as SavedCG[];
      resolve(results.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject("Failed to load gallery");
  });
};

// --- Save/Load Functions ---

export const saveGame = async (slotId: string, state: GameState): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([SAVES_STORE], "readwrite");
  const store = transaction.objectStore(SAVES_STORE);

  const saveSlot: SaveSlot = {
    id: slotId,
    timestamp: Date.now(),
    location: state.location,
    turnCount: state.turnCount,
    previewImage: state.currentBgImage || "",
    gameState: state
  };

  return new Promise((resolve, reject) => {
    const request = store.put(saveSlot);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save game");
  });
};

export const getSaves = async (): Promise<SaveSlot[]> => {
  const db = await openDB();
  const transaction = db.transaction([SAVES_STORE], "readonly");
  const store = transaction.objectStore(SAVES_STORE);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result as SaveSlot[];
      resolve(results.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject("Failed to load saves");
  });
};

export const deleteSave = async (slotId: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([SAVES_STORE], "readwrite");
  const store = transaction.objectStore(SAVES_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(slotId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to delete save");
  });
};

// --- Prompt Management Functions ---

export interface SavedPrompt {
  id?: number;
  type: string;
  content: string;
  timestamp: number;
}

export const savePromptVersion = async (type: string, content: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([PROMPTS_STORE], "readwrite");
  const store = transaction.objectStore(PROMPTS_STORE);
  const item: SavedPrompt = {
    type,
    content,
    timestamp: Date.now()
  };
  return new Promise((resolve, reject) => {
    const request = store.add(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save prompt");
  });
};

export const getPromptHistory = async (type: string): Promise<SavedPrompt[]> => {
  const db = await openDB();
  const transaction = db.transaction([PROMPTS_STORE], "readonly");
  const store = transaction.objectStore(PROMPTS_STORE);
  const index = store.index("type");

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.only(type));
    request.onsuccess = () => {
      const results = request.result as SavedPrompt[];
      // Sort by timestamp desc
      resolve(results.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject("Failed to load prompt history");
  });
};

export const getLatestPrompt = async (type: string): Promise<string | null> => {
    const history = await getPromptHistory(type);
    if (history && history.length > 0) {
        return history[0].content;
    }
    return null;
};
