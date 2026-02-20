const PROMPT =
  "Transform this 2D architectural floor plan into a photorealistic 3D bird's-eye view visualization. Show each room with realistic furniture, flooring textures, and warm interior lighting. Preserve the spatial arrangement from the 2D plan. Make it look like a professional architectural 3D rendering.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    return res.status(500).json({ error: "Server not configured" });
  }

  const { image, name } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  const base64Data = image.includes(",") ? image.split(",")[1] : image;
  const mimeType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

  console.log(`[Render] Starting 3D render for: ${name || "Untitled"}`);

  // Convert base64 to binary buffer for HuggingFace
  const imageBuffer = Buffer.from(base64Data, "base64");

  // Call HuggingFace Inference API - instruct-pix2pix for image-to-image transformation
  const hfResponse = await fetch(
    "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
        "X-Wait-For-Model": "true",
      },
      body: JSON.stringify({
        inputs: base64Data,
        parameters: {
          prompt: PROMPT,
          negative_prompt: "blurry, low quality, 2D, flat, cartoon",
          image_guidance_scale: 1.5,
          guidance_scale: 7.5,
          num_inference_steps: 20,
        },
      }),
    }
  );

  if (!hfResponse.ok) {
    const errText = await hfResponse.text();
    console.error("[Render] HuggingFace API error:", hfResponse.status, errText);
    return res.status(hfResponse.status).json({ error: errText });
  }

  // HuggingFace returns binary image data
  const imageArrayBuffer = await hfResponse.arrayBuffer();
  const resultBase64 = Buffer.from(imageArrayBuffer).toString("base64");
  const renderedImage = `data:image/jpeg;base64,${resultBase64}`;

  console.log("[Render] 3D render complete!");
  return res.status(200).json({ renderedImage });
}
