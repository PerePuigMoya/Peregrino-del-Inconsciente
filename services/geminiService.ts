import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, AI_PERSONA_PEREGRINO } from "../constants";
import { ArquetipoName, ChatMessage } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("No se encontró la API Key de Gemini.");
    throw new Error("API_KEY no encontrada");
  }

  return new GoogleGenAI({ apiKey });
};

const BOLD_INSTRUCTION = `
RECUERDA: Usa etiquetas <strong></strong> para negritas. NUNCA menciones hexagramas ni números técnicos.
`;

const SYSTEM_INSTRUCTION = {
  parts: [{ text: AI_PERSONA_PEREGRINO }],
};

export const getOraculoInterpretation = async (
  history: ChatMessage[],
  hexagramNumber: number,
  changingLines: number[]
): Promise<string> => {
  try {
    const ai = getAIClient();

    const chatContext = history
      .map((m) => `${m.sender === "user" ? "Consultante" : "Peregrino"}: ${m.text}`)
      .join("\n");

    const userPrompt = `
${BOLD_INSTRUCTION}

Estás en la sección de Consulta al Peregrino.

Reglas de comportamiento para esta sección:

- Si el consultante solo ha saludado o todavía no ha explicado su asunto, no hagas ninguna interpretación arquetípica.
- En ese caso responde de forma natural, humana y breve, invitando al consultante a explicar qué quiere explorar.
- Si el consultante ya ha explicado una situación, conflicto, duda o momento vital, entonces puedes comenzar el análisis arquetípico.
- No utilices siempre una estructura fija.
- No conviertas cada respuesta en una pieza poética u oracular.
- Prioriza una conversación humana y natural.
- Puedes hacer preguntas para profundizar antes de cerrar una interpretación.
- Solo usa arquetipos cuando haya suficiente información.

- Cuando expliques una dinámica psicológica, prioriza siempre el lenguaje de los 12 arquetipos del sistema:
  Inocente, Huérfano, Buscador, Amante, Guerrero, Bienhechora, Creador, Destructor, Mago, Gobernante, Sabio, Bufón.

- Evita sustituirlos por etiquetas genéricas como:
  protector, guía, visionario, estratega, autoridad, tierra, energía antigua, fuerza interna, instinto de supervivencia
  si existe un equivalente claro dentro de los 12 arquetipos.

- Si hablas de autoridad, jerarquía, validación, normas, control o poder, usa preferentemente <strong>Gobernante</strong> o <strong>Gobernante en sombra</strong>.
- Si hablas de herida, exclusión, rechazo, indefensión, vergüenza o sentirse no elegido, usa preferentemente <strong>Huérfano</strong> o <strong>Huérfano en sombra</strong>.
- Si hablas de afirmarse, protegerse, reaccionar, defender límites o sostenerse, usa preferentemente <strong>Guerrero</strong>.
- Si hablas de cuidar, contener, sostener o acompañar, usa preferentemente <strong>Bienhechora</strong>.
- Si hablas de visión, comprensión, lectura de la situación o claridad mental, usa preferentemente <strong>Sabio</strong>.
- Si hablas de transformación de la experiencia o cambio profundo de perspectiva, usa preferentemente <strong>Mago</strong>.

- En tus respuestas normales, nombra explícitamente los arquetipos cuando exista base suficiente para hacerlo.
- No te quedes en explicaciones psicológicas genéricas si ya puedes traducir la situación al lenguaje arquetípico del sistema.

- Puedes usar también, cuando realmente ayuden, los conceptos de <strong>Persona</strong>, <strong>Sombra</strong>, <strong>Ánima</strong> y <strong>Ánimus</strong>, pero solo si aportan claridad real.

- Cuando ya exista suficiente información sobre el asunto del consultante, puedes proponer de forma natural ofrecer una lectura más ordenada en forma de informe arquetípico.
- Considera que hay suficiente información cuando ya se han identificado:
  • el asunto principal
  • la vivencia emocional
  • alguna tensión interna o dinámica psicológica
  • algún rasgo, herida, capacidad o dificultad relevante

- Cuando ocurra esto puedes decir algo como:
"Si quieres, con lo que ya me has contado puedo devolverte ahora una lectura más ordenada en forma de informe arquetípico."

- No propongas el informe al principio de la conversación.
- Si ya has entregado un informe arquetípico en la conversación, no vuelvas a decir que vas a entregarlo como si todavía no lo hubieras hecho.

- Usa los datos técnicos internos (Hexagrama ${hexagramNumber}, Líneas ${changingLines.join(",")}) solo como guía energética interna. Nunca los menciones.

Historial de la conversación:
${chatContext}

Si todavía no hay asunto claro, responde con algo sencillo como:
"Hola. ¿Qué te gustaría explorar hoy?"
o
"Cuéntame un poco más sobre lo que está pasando."

Si ya hay un asunto claro, responde como el Peregrino del Inconsciente ayudando a comprender la situación de forma natural, cercana y clara.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error en el Oráculo:", error);
    return "El Peregrino ha entrado en un momento de profundo silencio.";
  }
};

export const getArchetypalReport = async (
  history: ChatMessage[],
  hexagramNumber: number,
  changingLines: number[]
): Promise<string> => {
  try {
    const ai = getAIClient();

    const chatContext = history
      .map((m) => `${m.sender === "user" ? "Consultante" : "Peregrino"}: ${m.text}`)
      .join("\n");

    const userPrompt = `
${BOLD_INSTRUCTION}

Estás en la sección de Consulta al Peregrino.

Ahora no estás continuando la conversación normal.
Ahora estás generando un informe arquetípico a partir de la conversación previa.

Reglas de comportamiento para este informe:

- El informe debe utilizar prioritariamente el lenguaje de los 12 arquetipos del sistema.
- Evita etiquetas genéricas como protector, guía, estratega, visionario o autoridad externa si pueden traducirse a los 12 arquetipos.
- Siempre que sea posible, nombra explícitamente qué arquetipos están activos.
- Si aporta claridad, puedes incluir también <strong>Persona</strong>, <strong>Sombra</strong>, <strong>Ánima</strong> y <strong>Ánimus</strong>.
- Si ya existe un informe previo muy reciente dentro de la misma conversación, no digas que “ya lo has dado”; simplemente responde con una versión nueva, ordenada y útil.
- No escribas como en un chat.
- No uses tono oracular, místico o grandilocuente.
- Habla de forma humana, clara, ordenada y cercana.
- No inventes información que no esté en la conversación.
- Si falta información importante, dilo con honestidad.
- Usa los datos técnicos internos (Hexagrama ${hexagramNumber}, Líneas ${changingLines.join(",")}) solo como guía energética interna. Nunca los menciones.

Historial de la conversación:
${chatContext}

Genera el informe con esta estructura:

<strong>1. Tu asunto central</strong>
Resume de forma clara cuál parece ser el asunto principal del consultante.

<strong>2. El arquetipo desde el que hablas</strong>
Identifica la energía predominante desde la que parece expresarse.

<strong>3. El conflicto arquetípico principal</strong>
Describe el bloqueo, tensión o sombra principal.

<strong>4. La dinámica interna</strong>
Explica qué arquetipos parecen estar en tensión o interacción.

<strong>5. La raíz del problema</strong>
Señala qué base psicológica podría no estar integrada del todo, si se puede inferir con suficiente fundamento.

<strong>6. La medicina arquetípica</strong>
Indica qué energía ayudaría a equilibrar la situación.

<strong>7. Clave de integración</strong>
Formula una reflexión central que ayude al consultante a comprender mejor su proceso.

<strong>8. Preguntas para seguir profundizando</strong>
Cierra con 2 o 3 preguntas útiles y humanas.

Responde como el Peregrino del Inconsciente.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error en informe arquetípico:", error);
    return "Ahora mismo no he podido ordenar la conversación en un informe arquetípico. Inténtalo de nuevo en un momento.";
  }
};

export const getArchetypeDescription = async (
  archetypeName: ArquetipoName
): Promise<string> => {
  try {
    const ai = getAIClient();

    const userPrompt = `
Presenta el arquetipo: <strong>${archetypeName}</strong>.
${BOLD_INSTRUCTION}

Habla de forma clara, cercana y comprensible.
No uses un tono excesivamente solemne ni oracular.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error en descripción de arquetipo:", error);
    return "La sabiduría de los arquetipos se encuentra velada.";
  }
};

export const getDreamInterpretation = async (
  history: ChatMessage[]
): Promise<string> => {
  try {
    const ai = getAIClient();

    const chatContext = history
      .map((m) => `${m.sender === "user" ? "Consultante" : "Peregrino"}: ${m.text}`)
      .join("\n");

    const userPrompt = `
${BOLD_INSTRUCTION}

Estás en la sección de Interpretación de Sueños.

Reglas de comportamiento para esta sección:

- Si el consultante todavía no ha contado un sueño, no lo interpretes.
- En ese caso responde pidiendo que lo relate con más detalle.
- Si el sueño ya ha sido contado, analiza símbolos, emociones y posibles dinámicas arquetípicas.
- No afirmes significados universales cerrados.
- Haz preguntas para profundizar en el significado subjetivo del sueño.
- Prioriza una conversación humana, clara y natural.
- No uses un tono excesivamente oracular o literario.

Historial del diálogo onírico:
${chatContext}

Si todavía no hay sueño claro, responde con algo sencillo como:
"Cuéntame el sueño con el mayor detalle que recuerdes."

Si ya hay sueño, responde como el Peregrino manteniendo el enfoque en la construcción conjunta del significado.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error en interpretación de sueños:", error);
    return "Las nieblas del sueño son densas ahora mismo. Intentemos conectar más tarde.";
  }
};

export const getDreamReport = async (
  history: ChatMessage[]
): Promise<string> => {
  try {
    const ai = getAIClient();

    const chatContext = history
      .map((m) => `${m.sender === "user" ? "Consultante" : "Peregrino"}: ${m.text}`)
      .join("\n");

    const userPrompt = `
${BOLD_INSTRUCTION}

Estás en la sección de Interpretación de Sueños.

Ahora no estás continuando la conversación normal.
Ahora estás generando un informe del sueño a partir de la conversación previa.

Reglas de comportamiento para este informe:

- No escribas como en un chat.
- No uses tono excesivamente oracular, literario o grandilocuente.
- Habla de forma humana, clara, ordenada y cercana.
- No inventes información que no esté en la conversación.
- No cierres el significado del sueño como si fuera una verdad absoluta.
- Formula hipótesis abiertas y bien sostenidas.
- Si falta información importante, dilo con honestidad.
- Usa lenguaje arquetípico cuando ayude a comprender mejor el sueño.
- Si resulta útil, puedes nombrar <strong>Sombra</strong>, <strong>Persona</strong>, <strong>Ánima</strong> o <strong>Ánimus</strong>, pero solo si realmente aportan claridad.

Historial del diálogo onírico:
${chatContext}

Genera el informe con esta estructura:

<strong>1. Resumen del sueño</strong>
Resume brevemente el contenido principal del sueño.

<strong>2. Símbolos principales</strong>
Identifica los símbolos, personajes, escenas o elementos más importantes.

<strong>3. Clima emocional</strong>
Describe qué emociones parecen estar activas en el sueño y en la conversación.

<strong>4. Arquetipos implicados</strong>
Señala qué arquetipos podrían estar presentes y por qué.

<strong>5. Posible mensaje del sueño</strong>
Formula una hipótesis abierta sobre lo que el sueño podría estar mostrando al consultante.

<strong>6. Preguntas para profundizar</strong>
Cierra con 2 o 3 preguntas útiles, humanas y abiertas para seguir explorándolo.

Responde como el Peregrino del Inconsciente.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error en informe de sueño:", error);
    return "Ahora mismo no he podido ordenar el sueño en un informe. Inténtalo de nuevo en un momento.";
  }
};
