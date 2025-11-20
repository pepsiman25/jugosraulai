export async function onRequestPost(context) {
  const { jugo, enfermedad } = await context.request.json();

  let prompt = `En español, considerando las siguientes recetas, cual es la mas apropiada para la necesidad "${jugo}"?.
🥤 1) Batido Energético Antioxidante
Ingredientes (1 porción):
Fresa: 100 g
Mora: 80 g
Banana: 80 g
Leche: 200 ml
Miel: 10 g (1 cucharadita)
Preparación: Licuar todo hasta obtener una mezcla cremosa.
✔ Beneficios
Alto en vitamina C, antioxidantes, energía natural.
Rico en fibra y potasio.
Valores nutricionales aproximados
Energía: 210 kcal
Vitamina C: ~90 mg → 100% VD
Fibra: 6 g → 21% VD
Proteína: 7 g
Potasio: ~650 mg → 18% VD
🍊 3) Jugo Refrescante Digestivo (citrus–ginger)
Ingredientes:
Naranja: 200 g (2 naranjas)
Limón: 30 g (1 limón)
Jengibre fresco: 5 g
Miel o estevia: a gusto
Agua: 200 ml
Menta: 5 g (unas hojas)
✔ Beneficios
Refrescante, alto en vitamina C, ayuda a digestión e inflamación.
Valores nutricionales aproximados
Energía: 110 kcal (con 5 g miel)
Vitamina C: ~140 mg → 155% VD
Fibra: 2 g
Antiinflamatorio natural (jengibre).
🍃 5) Batido Suave Digestivo Papaya–Manzanilla
Ingredientes:
Papaya: 180 g
Banana: 60 g
Manzanilla (infusión concentrada): 150 ml
Jengibre: 3 g (opcional para aumentar digestión)
✔ Beneficios
Ideal para estómago sensible, hidratación y digestión.
Bajo en grasa y excelente para la mañana.
Valores nutricionales aproximados
Energía: 140 kcal
Vitamina A: 80 µg → 9–10% VD
Vitamina C: 70 mg → 78% VD
Fibra: 4 g → 14% VD
🥭 4) Batido Papaya–Fresa Antiinflamatorio
Ingredientes:
Papaya: 150 g
Fresa: 100 g
Jengibre: 4 g
Miel/estevia: a gusto
Agua: 150 ml
✔ Beneficios
Rico en vitamina C, antioxidantes, fibra y compuestos antiinflamatorios del jengibre.
Valores nutricionales
Energía: ~135 kcal
Vitamina C: ~110 mg → 122% VD
Fibra: 4.8 g → 17% VD
Vitamina A: 95 µg → 11% VD
Potasio: 430 mg → 9% VD
💜 6) Mora–Banana Power Smoothie
Ingredientes:
Mora: 120 g
Banana: 100 g
Leche: 200 ml
Miel/estevia: a gusto
✔ Beneficios
Alta energía, antioxidantes potentes, proteína ligera.
Valores nutricionales
Energía: ~240 kcal
Vitamina C: 55 mg → 61% VD
Fibra: 6.5 g → 23% VD
Proteína: 8 g
Potasio: 720 mg → 20% VD
Calcio: ~250 mg → 25% VD
🥭 2) Batido Digestivo Papaya–Avena–Linaza (“Digestión Plus”)
Ingredientes:
Papaya picada 1 taza (≈140 g)
Jugo de naranja natural ½ taza (≈120 ml)
Avena en hojuelas ¼ taza (≈20 g)
Linaza molida 1 cucharada (≈10 g)
Preparación:
Colocar primero papaya y linaza en la licuadora.
Añadir la avena para aportar fibra soluble.
Incorporar el jugo de naranja como medio líquido.
Licuar hasta obtener textura homogénea.
Servir inmediatamente.
Beneficios:
Regula el tránsito intestinal por su alto contenido de fibra (papaya, avena, linaza).
Mejora la digestión gracias a la papaína de la papaya y al mucílago de la linaza.
Aporta omega-3 vegetal, útil para funciones cerebrales.
Alta vitamina C y antioxidantes para defensas y tejidos.
Valores nutricionales:
Energía: ~220 kcal
Fibra: 7–8 g (28–32% VD)
Vitamina C: 90 mg (100% VD)
Vitamina A: 110 µg (12% VD)
Omega-3 (ALA): ~2.3 g
Potasio: ~480 mg (10% VD)
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
