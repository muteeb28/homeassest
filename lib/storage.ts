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

// Declare puter global (loaded via script tag in root.tsx)
declare const puter: {
  ai: {
    txt2img: (
      prompt: string,
      options?: {
        model?: string;
        input_image?: string;
        input_image_mime_type?: string;
      },
    ) => Promise<HTMLImageElement>;
  };
};

const waitForPuter = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof puter !== "undefined" && puter?.ai?.txt2img) {
      return resolve();
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof puter !== "undefined" && puter?.ai?.txt2img) {
        clearInterval(interval);
        resolve();
      } else if (attempts > 100) {
        clearInterval(interval);
        reject(new Error("Puter.js SDK did not load within 10 seconds"));
      }
    }, 100);
  });

const imageElementToBase64 = (img: HTMLImageElement): Promise<string> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Could not get canvas context"));
    ctx.drawImage(img, 0, 0);
    resolve(canvas.toDataURL("image/png"));
  });

export const renderProject = async (
  id: string,
  image: string,
  name?: string,
): Promise<string | null> => {
  try {
    console.log(`[Render] Starting 3D render for: ${name || "Untitled"}`);

    await waitForPuter();

    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const mimeType: string = image.startsWith("data:image/png")
      ? "image/png"
      : "image/jpeg";

    console.log("[Render] Calling puter.ai.txt2img with gemini-2.5-flash-image-preview...");

    const resultImg = await puter.ai.txt2img(
      "You are given a 2D architectural floor plan. Transform it into a photorealistic 3D bird's-eye view visualization that faithfully follows the exact room layout, walls, and dimensions shown in the floor plan. Show each room with realistic furniture, flooring textures, and warm interior lighting. Preserve the spatial arrangement from the 2D plan — do not invent rooms or rearrange the layout. Make it look like a professional architectural 3D rendering.",
      {
        model: "gemini-2.5-flash-image-preview",
        input_image: base64Data,
        input_image_mime_type: mimeType,
      },
    );

    const renderedImage = await imageElementToBase64(resultImg);
    console.log("[Render] 3D render complete!");

    // Update the project in IndexedDB
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
