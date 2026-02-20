const PROMPT =
  "You are given a 2D architectural floor plan. Transform it into a photorealistic 3D bird's-eye view visualization that faithfully follows the exact room layout, walls, and dimensions shown in the floor plan. Show each room with realistic furniture, flooring textures, and warm interior lighting. Preserve the spatial arrangement from the 2D plan — do not invent rooms or rearrange the layout. Make it look like a professional architectural 3D rendering.";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.STITCH_API_KEY;
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

  const puterResponse = await fetch("https://api.puter.com/drivers/call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      interface: "puter-image-generation",
      method: "generate",
      args: {
        prompt: PROMPT,
        model: "gemini-2.5-flash-image-preview",
        input_image: base64Data,
        input_image_mime_type: mimeType,
      },
    }),
  });

  if (!puterResponse.ok) {
    const errText = await puterResponse.text();
    console.error("[Render] Puter API error:", puterResponse.status, errText);
    return res.status(puterResponse.status).json({ error: errText });
  }

  const data = await puterResponse.json();
  console.log("[Render] Puter API response:", JSON.stringify(data).slice(0, 200));

  let renderedImage = null;
  if (data?.result?.image) renderedImage = data.result.image;
  else if (data?.result?.url) renderedImage = data.result.url;
  else if (data?.result?.data) renderedImage = `data:image/png;base64,${data.result.data}`;
  else if (typeof data?.result === "string") renderedImage = data.result;

  if (!renderedImage) {
    console.error("[Render] No image in response:", JSON.stringify(data));
    return res.status(500).json({ error: "No image returned from Puter" });
  }

  console.log("[Render] 3D render complete!");
  return res.status(200).json({ renderedImage });
};
