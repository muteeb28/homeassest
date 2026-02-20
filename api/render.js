// Step 1: Use HuggingFace image captioning to understand the floor plan
async function describeFloorPlan(base64Data, hfToken) {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/Salesforce/blip-image-captioning-large",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
        "X-Wait-For-Model": "true",
      },
      body: JSON.stringify({ inputs: base64Data }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Captioning failed: ${err}`);
  }

  const data = await response.json();
  // Response is [{ generated_text: "..." }]
  return Array.isArray(data) ? data[0]?.generated_text ?? "" : data?.generated_text ?? "";
}

// Step 2: Use FLUX to generate the 3D visualization
async function generateWithFlux(description, hfToken) {
  const prompt = `Photorealistic 3D bird's-eye view architectural interior rendering based on this layout: ${description}. Show each room with realistic modern furniture, hardwood flooring, warm ambient lighting, plants and decor. Ultra detailed professional architectural visualization, top-down perspective, 8k quality, no people, no text.`;

  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
        "X-Wait-For-Model": "true",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 4,
          guidance_scale: 0,
          width: 1024,
          height: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`FLUX generation failed: ${err}`);
  }

  const imageBuffer = await response.arrayBuffer();
  return `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString("base64")}`;
}

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

  console.log(`[Render] Starting for: ${name || "Untitled"}`);

  try {
    console.log("[Render] Step 1: Captioning floor plan...");
    const description = await describeFloorPlan(base64Data, hfToken);
    console.log("[Render] Caption:", description);

    console.log("[Render] Step 2: Generating 3D render with FLUX...");
    const renderedImage = await generateWithFlux(description, hfToken);

    console.log("[Render] Complete!");
    return res.status(200).json({ renderedImage });
  } catch (error) {
    console.error("[Render] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
