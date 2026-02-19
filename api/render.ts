export const config = { maxDuration: 60 };

const PROMPT =
  "You are given a 2D architectural floor plan. Transform it into a photorealistic 3D bird's-eye view visualization that faithfully follows the exact room layout, walls, and dimensions shown in the floor plan. Show each room with realistic furniture, flooring textures, and warm interior lighting. Preserve the spatial arrangement from the 2D plan — do not invent rooms or rearrange the layout. Make it look like a professional architectural 3D rendering.";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, name } = req.body ?? {};

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  console.log(`[Render] Starting 3D render for: ${name || "Untitled"}`);

  try {
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const mimeType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
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
      console.error(`[Render] Gemini error ${response.status}:`, errText);
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

    if (!renderedImage) {
      console.error("[Render] No image part in Gemini response:", JSON.stringify(data).slice(0, 500));
      throw new Error("No image returned from Gemini");
    }

    console.log("[Render] 3D render complete!");
    return res.json({ success: true, renderedImage });
  } catch (error) {
    console.error("[Render] Fatal error:", error);
    return res.status(500).json({
      error: "Rendering failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
