const PROMPT =
  "Photorealistic 3D bird's-eye view architectural interior rendering, top-down perspective, modern home with realistic furniture, hardwood and marble flooring, warm ambient lighting, indoor plants, decorative items, professional architectural visualization, ultra detailed, 8k quality, no people, no text";

const NEGATIVE_PROMPT =
  "2D, flat, sketch, blueprint, cartoon, low quality, blurry, distorted, people, text, labels";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stabilityKey = process.env.STABILITY_API_KEY;
  if (!stabilityKey) {
    return res.status(500).json({ error: "Server not configured" });
  }

  const { image, name } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  const base64Data = image.includes(",") ? image.split(",")[1] : image;
  const mimeType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";
  const imageBuffer = Buffer.from(base64Data, "base64");

  console.log(`[Render] Starting for: ${name || "Untitled"}`);

  const formData = new FormData();
  formData.append("image", new Blob([imageBuffer], { type: mimeType }), "floor_plan.jpg");
  formData.append("prompt", PROMPT);
  formData.append("negative_prompt", NEGATIVE_PROMPT);
  formData.append("control_strength", "0.7");
  formData.append("output_format", "jpeg");

  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/control/structure",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stabilityKey}`,
        Accept: "application/json",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("[Render] Stability AI error:", response.status, err);
    return res.status(response.status).json({ error: err });
  }

  const data = await response.json();

  if (!data.image) {
    console.error("[Render] No image in response:", JSON.stringify(data));
    return res.status(500).json({ error: "No image returned" });
  }

  const renderedImage = `data:image/jpeg;base64,${data.image}`;
  console.log("[Render] 3D render complete!");
  return res.status(200).json({ renderedImage });
}
