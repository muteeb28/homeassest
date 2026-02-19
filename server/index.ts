import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env file since tsx doesn't do it automatically
try {
  const envContent = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch {
  // no .env file — rely on system environment
}

import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const app = express();
const PORT = 3001;

const STITCH_API_KEY = process.env.STITCH_API_KEY;

app.use(express.json({ limit: "20mb" }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.post("/api/render", async (req, res) => {
  const { image, name } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  if (!STITCH_API_KEY) {
    console.error("STITCH_API_KEY is not set in .env");
    return res.status(500).json({ error: "API key not configured" });
  }

  console.log(`[Render] Starting 3D render for: ${name || "Untitled"}`);

  try {
    // Extract base64 data (strip data URL prefix if present)
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const mimeType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    // Call Puter AI img2img to transform 2D floor plan into 3D architectural render
    const puterResponse = await fetch("https://api.puter.com/drivers/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STITCH_API_KEY}`,
      },
      body: JSON.stringify({
        interface: "puter-image-generation",
        method: "generate",
        args: {
          prompt:
            "You are given a 2D architectural floor plan. Transform it into a photorealistic 3D bird's-eye view visualization that faithfully follows the exact room layout, walls, and dimensions shown in the floor plan. Show each room with realistic furniture, flooring textures, and warm interior lighting. Preserve the spatial arrangement from the 2D plan — do not invent rooms or rearrange the layout. Make it look like a professional architectural 3D rendering.",
          model: "gemini-2.5-flash-image-preview",
          input_image: base64Data,
          input_image_mime_type: mimeType,
        },
      }),
    });

    if (!puterResponse.ok) {
      const errorText = await puterResponse.text();
      console.error("[Render] Puter API error:", puterResponse.status, errorText);
      throw new Error(`Puter API returned ${puterResponse.status}: ${errorText}`);
    }

    const puterData = await puterResponse.json();
    console.log("[Render] Puter API response received:", JSON.stringify(puterData).slice(0, 300));

    // Extract the rendered image from the response
    let renderedImage: string | null = null;

    if (puterData?.result?.image) {
      renderedImage = puterData.result.image;
    } else if (puterData?.result?.url) {
      renderedImage = puterData.result.url;
    } else if (puterData?.result?.data) {
      renderedImage = `data:image/png;base64,${puterData.result.data}`;
    } else if (typeof puterData?.result === "string") {
      renderedImage = puterData.result;
    }

    if (!renderedImage) {
      console.error("[Render] No image in Puter response:", JSON.stringify(puterData));
      throw new Error("No rendered image returned from Puter AI");
    }

    console.log("[Render] 3D render complete!");
    return res.json({
      success: true,
      renderedImage,
      message: "3D rendering complete",
    });
  } catch (error) {
    console.error("[Render] Error:", error);
    return res.status(500).json({
      error: "Rendering failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Auth/Render server running on http://localhost:${PORT}`);
});
