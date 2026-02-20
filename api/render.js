// Step 1: Use Gemini (free text tier) to describe the floor plan
async function describeFloorPlan(base64Data, mimeType, geminiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this 2D architectural floor plan. Describe the rooms, their layout, sizes, and arrangement in 2-3 sentences. Focus on what rooms exist and how they connect. Be specific and concise.",
              },
              { inlineData: { mimeType, data: base64Data } },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) throw new Error("Gemini analysis failed");
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Step 2: Use FLUX (free) to generate a 3D visualization from the description
async function generateWithFlux(floorPlanDescription, hfToken) {
  const prompt = `Photorealistic 3D bird's-eye view architectural interior rendering. ${floorPlanDescription} Show each room with realistic furniture, hardwood and tile flooring, warm ambient lighting, plants, cushions, decorative items. Professional architectural visualization, ultra detailed, top-down perspective, 8k quality, no people.`;

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
    throw new Error(err);
  }

  const imageBuffer = await response.arrayBuffer();
  return `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString("base64")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const hfToken = process.env.HF_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!hfToken || !geminiKey) {
    return res.status(500).json({ error: "Server not configured" });
  }

  const { image, name } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  const base64Data = image.includes(",") ? image.split(",")[1] : image;
  const mimeType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

  console.log(`[Render] Starting for: ${name || "Untitled"}`);

  try {
    // Step 1: Describe the floor plan with Gemini (free text API)
    console.log("[Render] Step 1: Analysing floor plan with Gemini...");
    const description = await describeFloorPlan(base64Data, mimeType, geminiKey);
    console.log("[Render] Floor plan description:", description);

    // Step 2: Generate 3D visualization with FLUX
    console.log("[Render] Step 2: Generating 3D render with FLUX...");
    const renderedImage = await generateWithFlux(description, hfToken);

    console.log("[Render] Complete!");
    return res.status(200).json({ renderedImage });
  } catch (error) {
    console.error("[Render] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
