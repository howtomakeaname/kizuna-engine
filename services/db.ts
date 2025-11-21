import { SavedCG, UnlockableCG, GameState, SaveSlot } from "../types";

const DB_NAME = "KizunaEngineDB";
const GALLERY_STORE = "gallery";
const SAVES_STORE = "saves";
const DB_VERSION = 2;

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