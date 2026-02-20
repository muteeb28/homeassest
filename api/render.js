const PROMPT =
  "Photorealistic 3D bird's-eye view interior architectural rendering of a modern Indian home. Spacious living room with L-shaped sofa, coffee table, TV unit. Open kitchen with island, dining table for 6. Master bedroom with king bed, wardrobes. Warm ambient lighting, marble and hardwood flooring, indoor plants, decorative cushions. Ultra detailed professional visualization, top-down perspective, 8k quality, no people, no text.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    return res.status(500).json({ error: "Server not configured" });
  }

  const { name } = req.body || {};

  console.log(`[Render] Starting for: ${name || "Untitled"}`);

  const hfResponse = await fetch(
    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
        "X-Wait-For-Model": "true",
      },
      body: JSON.stringify({
        inputs: PROMPT,
        parameters: {
          num_inference_steps: 4,
          guidance_scale: 0,
          width: 1024,
          height: 1024,
        },
      }),
    }
  );

  if (!hfResponse.ok) {
    const err = await hfResponse.text();
    console.error("[Render] FLUX error:", hfResponse.status, err);
    return res.status(hfResponse.status).json({ error: err });
  }

  const imageBuffer = await hfResponse.arrayBuffer();
  const renderedImage = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString("base64")}`;

  console.log("[Render] 3D render complete!");
  return res.status(200).json({ renderedImage });
}
