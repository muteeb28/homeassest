const PROMPT =
  "You are given a 2D architectural floor plan. Transform it into a photorealistic 3D bird's-eye view visualization that faithfully follows the exact room layout, walls, and dimensions shown in the floor plan. Show each room with realistic furniture, flooring textures, and warm interior lighting. Preserve the spatial arrangement from the 2D plan — do not invent rooms or rearrange the layout. Make it look like a professional architectural 3D rendering.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server not configured" });
  }

  const { image, name } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  const base64Data = image.includes(",") ? image.split(",")[1] : image;
  const mimeType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

  console.log(`[Render] Starting 3D render for: ${name || "Untitled"}`);

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
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
    }
  );

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    console.error("[Render] Gemini API error:", geminiResponse.status, errText);
    return res.status(geminiResponse.status).json({ error: errText });
  }

  const data = await geminiResponse.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];

  let renderedImage = null;
  for (const part of parts) {
    if (part?.inlineData?.data) {
      renderedImage = `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!renderedImage) {
    console.error("[Render] No image in Gemini response:", JSON.stringify(data).slice(0, 500));
    return res.status(500).json({ error: "No image returned from Gemini" });
  }

  console.log("[Render] 3D render complete!");
  return res.status(200).json({ renderedImage });
}
