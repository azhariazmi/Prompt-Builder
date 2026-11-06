export async function enhancePrompt(prompt, style) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      style
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to generate prompt.");
  }

  return data.result;
}