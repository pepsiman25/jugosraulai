export async function onRequestPost(context) {
  const { jugo, enfermedad } = await context.request.json();

  let prompt = `En español, considerando las siguientes recetas, cual es la mas apropiada para el tema "${jugo}"?.
1) Batido Energético Antioxidante
Ingredientes (1 porción):
Fresa: 100 g
Mora: 80 g
Banana: 80 g
Leche: 200 ml
Miel: 10 g (1 cucharadita)
Preparación: Licuar todo hasta obtener una mezcla cremosa.
Valores nutricionales aproximados:
Energía: 210 kcal
Vitamina C: ~90 mg → 100% VD
Fibra: 6 g → 21% VD
Proteína: 7 g
Potasio: ~650 mg → 18% VD
2) Jugo Refrescante Digestivo
Ingredientes:
Naranja: 200 g (2 naranjas)
Limón: 30 g (1 limón)
Jengibre fresco: 5 g
Miel o estevia: a gusto
Agua: 200 ml
Menta: 5 g (unas hojas)
Beneficios
Refrescante, alto en vitamina C, ayuda a digestión e inflamación.
Valores nutricionales aproximados
Energía: 110 kcal (con 5 g miel)
Vitamina C: ~140 mg → 155% VD
Fibra: 2 g
Antiinflamatorio natural (jengibre).
3) Batido Suave Digestivo Papaya–Manzanilla
Ingredientes:
Papaya: 180 g
Banana: 60 g
Manzanilla (infusión concentrada): 150 ml
Miel o estevia: a gusto
Jengibre: 3 g (opcional para aumentar digestión)
Beneficios
Ideal para estómago sensible, hidratación y digestión.
Bajo en grasa y excelente para la mañana.
Valores nutricionales aproximados
Energía: 140 kcal
Vitamina A: 80 µg → 9–10% VD
Vitamina C: 70 mg → 78% VD
Fibra: 4 g → 14% VD

Incluye la receta entera nuevamente.
  `.trim();

  
  if (enfermedad && enfermedad.trim() !== "") {
  prompt += ` Toma "${enfermedad}" con mucha consideración.`;
  }
  // Workers AI
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${context.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.2-3b-instruct`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.CLOUDFLARE_AI_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Eres un doctor experto en nutrición. Responde como un asistente experimentado, procurando la salud del usuario." + "Incluye la receta de cualquier jugo mencionado"
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
