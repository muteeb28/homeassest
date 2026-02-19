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

const GEMINI_PROMPT =
  "You are given a 2D architectural floor plan. Transform it into a photorealistic 3D bird's-eye view visualization that faithfully follows the exact room layout, walls, and dimensions shown in the floor plan. Show each room with realistic furniture, flooring textures, and warm interior lighting. Preserve the spatial arrangement from the 2D plan — do not invent rooms or rearrange the layout. Make it look like a professional architectural 3D rendering.";

export const renderProject = async (
  id: string,
  image: string,
  name?: string,
): Promise<string | null> => {
  try {
    console.log(`[Render] Starting 3D render for: ${name || "Untitled"}`);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is not set");

    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const mimeType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: GEMINI_PROMPT },
                { inlineData: { mimeType, data: base64Data } },
              ],
            },
          ],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];

    let renderedImage: string | null = null;
    for (const part of parts) {
      if (part?.inlineData?.data) {
        renderedImage = `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!renderedImage) throw new Error("No image returned from Gemini");

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
