export async function onRequestPost(context) {
  const { jugo, enfermedad } = await context.request.json();

  let prompt = `En español, Narra una receta que se centre con el tema de "${jugo}".
  `.trim();
  
  if (enfermedad && enfermedad.trim() !== "") {
  prompt += ` Toma "${enfermedad}" con mucha consideración.`;
  }
  // Workers AI
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${context.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.CLOUDFLARE_AI_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Eres un doctor experto en nutrición. Responde como un asistente experimentado, procurando la salud del usuario."
           },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        skip_thinking: true,
        
        temperature: 0.7
      })
    }
  );

  const data = await response.json(); 
  
  // Remove any <think> that leaks
  let output = data.result.response || "";
  output = output.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  return new Response(
    JSON.stringify({ output_text: output }),
    { headers: { "Content-Type": "application/json" } }
  );
}
