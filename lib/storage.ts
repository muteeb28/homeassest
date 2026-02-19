import type { DesignHistoryItem } from "../type";

const AUTH_KEY = "homeasset_auth";
type StoredUser = { username: string; uuid: string };

export const signIn = async (username?: string): Promise<void> => {
  // No-op for now to keep upload independent
};

export const signOut = (): void => {
  // No-op
};

export const getCurrentUser = async (): Promise<StoredUser | null> => {
  return { username: "Guest", uuid: "guest-id" };
};

const DB_NAME = "homeasset";
const DB_VERSION = 1;
const STORE_NAME = "projects";

// ── IndexedDB helpers ──────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
};

const tx = async (
  mode: IDBTransactionMode,
): Promise<IDBObjectStore> => {
  const db = await openDB();
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
};

const req = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// ── Projects (IndexedDB — large image data) ───────────────────────

export const getProjectById = async ({
  id,
}: {
  id: string;
  scope?: "private" | "public";
  ownerId?: string | null;
}): Promise<DesignHistoryItem | null> => {
  const store = await tx("readonly");
  const item = await req<DesignHistoryItem | undefined>(store.get(id));
  return item ?? null;
};

export const getProjects = async (): Promise<DesignHistoryItem[]> => {
  const store = await tx("readonly");
  const items = await req<DesignHistoryItem[]>(store.getAll());
  return items.sort((a, b) => b.timestamp - a.timestamp);
};

export const saveProject = async (
  item: DesignHistoryItem,
  visibility: "private" | "public" = "private",
): Promise<DesignHistoryItem | null> => {
  const payload: DesignHistoryItem = {
    ...item,
    isPublic: visibility === "public",
  };

  const store = await tx("readwrite");
  await req(store.put(payload));
  return payload;
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const store = await tx("readwrite");
  await req(store.delete(id));
  return true;
};

export const shareProject = async (
  item: DesignHistoryItem,
): Promise<DesignHistoryItem | null> => saveProject(item, "public");

export const unshareProject = async (
  item: DesignHistoryItem,
): Promise<DesignHistoryItem | null> => saveProject(item, "private");

export const renderProject = async (
  id: string,
  image: string,
  name?: string,
): Promise<string | null> => {
  try {
    console.log(`[Render] Starting 3D render for: ${name || "Untitled"}`);

    const response = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, name }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.details || err.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const renderedImage: string = data.renderedImage;

    if (!renderedImage) throw new Error("No rendered image returned");

    console.log("[Render] 3D render complete!");

    const project = await getProjectById({ id });
    if (project) {
      await saveProject({ ...project, renderedImage });
    }

    return renderedImage;
  } catch (error) {
    console.error("[Render] Fatal error:", error);
    return null;
  }
};
