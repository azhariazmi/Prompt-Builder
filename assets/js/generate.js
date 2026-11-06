import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "OpenAI API is not configured. Add OPENAI_API_KEY in Vercel."
    });
  }

  try {
    const { prompt, style } = req.body || {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please provide a valid prompt."
      });
    }

    if (prompt.length > 6000) {
      return res.status(400).json({
        error: "Prompt cannot exceed 6000 characters."
      });
    }

    const allowedStyles = [
      "cinematic",
      "photorealistic",
      "dreamy",
      "editorial",
      "anime"
    ];

    const selectedStyle = allowedStyles.includes(style)
      ? style
      : "cinematic";

    const openai = new OpenAI({
      apiKey
    });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-astra",

      instructions: `
You are an expert AI prompt engineer.

Your job is to transform simple user descriptions into
detailed, high-quality prompts for AI image and video generators.

Requirements:

1. Preserve the user's original idea and intention.
2. Improve descriptive details and visual composition.
3. Include lighting, camera perspective and atmosphere.
4. Include realistic details where appropriate.
5. Follow the requested creative style.
6. Do not change the identity or intended characteristics
   of people described by the user.
7. Return only the completed prompt.
8. Do not include explanations, introductions or markdown.
9. Make the result suitable for external AI image generators.
      `,

      input: `
Creative style: ${selectedStyle}

Original user description:

${prompt}

Create an enhanced, detailed AI generation prompt.
      `,

      max_output_tokens: 1000
    });

    const result = response.output_text?.trim();

    if (!result) {
      return res.status(502).json({
        error: "OpenAI returned an empty response."
      });
    }

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error("OpenAI error:", error);

    return res.status(500).json({
      error: "AI generation failed. Check your API configuration and try again."
    });
  }
}