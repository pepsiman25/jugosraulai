export async function onRequestPost(context) {
  const { goal, contextParam } = await context.request.json();

  const prompt = `
  Escribe una receta breve de jugo natural para "${goal}".
  Toma "${contextParam}" con mucha consideración.
  `.trim();

  // Workers AI: Llama 3 - 8B Instruct (FREE)
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${context.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.CLOUDFLARE_AI_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    }
  );

  const data = await response.json();

  // Workers AI puts output text at result.response
  return new Response(JSON.stringify({
    output_text: data.result.response
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
