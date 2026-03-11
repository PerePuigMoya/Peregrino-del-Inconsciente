import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import {
  GEMINI_CHAT_MODEL_NAME,
  GEMINI_REPORT_MODEL_NAME,
  AI_PERSONA_PEREGRINO,
} from "../constants";
import { ArquetipoName, ChatMessage } from "../types";

const MAX_CONTEXT_CHARS = 22000;

const getAIClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("No se encontró la API Key de Gemini.");
    throw new Error("API_KEY no encontrada");
  }

  return new GoogleGenAI({ apiKey });
};

const BOLD_INSTRUCTION = `
RECUERDA: Usa etiquetas <strong></strong> para negritas. NUNCA menciones hexagramas, líneas cambiantes ni números técnicos.
`;

const SYSTEM_INSTRUCTION = {
  parts: [
    {
      text: `
${AI_PERSONA_PEREGRINO}

Habla de forma humana, clara, cercana y profunda.
No uses tono excesivamente místico, grandilocuente ni técnico.
No inventes información que la persona no haya dado.
Nunca menciones hexagramas, líneas cambiantes ni números técnicos.
`,
    },
  ],
};

const isQuotaError = (error: unknown): boolean => {
  const message = String(error || "");
  return (
    message.includes('"code":429') ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("Quota exceeded")
  );
};

const getErrorText = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const getFriendlyErrorMessage = (error: unknown, fallback: string): string => {
  if (isQuotaError(error)) {
    return "Hoy el Peregrino ha alcanzado su límite diario de consultas. Vuelve a intentarlo más tarde.";
  }
  return fallback;
};

const buildChatContext = (history: ChatMessage[]): string => {
  const text = history
    .map((m) => `${m.sender === "user" ? "Consultante" : "Peregrino"}: ${m.text}`)
    .join("\n");

  return text.length > MAX_CONTEXT_CHARS ? text.slice(-MAX_CONTEXT_CHARS) : text;
};

const generateWithModel = async (
  model: string,
  userPrompt: string
): Promise<string> => {
  const ai = getAIClient();

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    systemInstruction: SYSTEM_INSTRUCTION,
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
  });

  return response.text;
};

const generateReportWithFallback = async (
  userPrompt: string
): Promise<string> => {
  try {
    return await generateWithModel(GEMINI_REPORT_MODEL_NAME, userPrompt);
  } catch (error) {
    console.error(
      "Error con modelo de informe, probando fallback:",
      getErrorText(error),
      error
    );

    if (isQuotaError(error)) {
      return await generateWithModel(GEMINI_CHAT_MODEL_NAME, userPrompt);
    }

    throw error;
  }
};

/* =========================
   PROMPTS
========================= */

const buildOraculoPrompt = (
  chatContext: string,
  hexagramNumber: number,
  changingLines: number[]
): string => `
${BOLD_INSTRUCTION}

# Consulta al Peregrino

Estás en la sección **Consulta al Peregrino**.

Tu tarea es acompañar al consultante a explorar un asunto personal, emocional, relacional o vital usando como lenguaje principal el sistema de los **12 arquetipos**.

## Guía sincrónica interna
Usa estos datos solo como orientación interna. Nunca los menciones:
- Hexagrama: ${hexagramNumber}
- Líneas cambiantes: ${changingLines.join(",")}

## Objetivo
Ayuda al consultante a:
- comprender qué le está pasando
- reconocer el arquetipo protagonista
- detectar la posible sombra o desequilibrio
- orientar un movimiento de equilibrio útil y realista

## Reglas
- Si el consultante solo ha saludado o todavía no ha explicado su asunto, no hagas interpretación arquetípica.
- En ese caso responde de forma natural, breve y humana, invitando a explicar qué quiere explorar.
- Si ya ha explicado una situación, conflicto, duda o momento vital, puedes comenzar el análisis.
- Prioriza una conversación humana, cercana y clara.
- No uses tono solemne, poético u oracular.
- No inventes información.
- No cierres la interpretación como una verdad absoluta.
- Formula hipótesis abiertas, precisas y comprensibles.
- Si falta información, pregunta antes de interpretar demasiado.
- No uses explicaciones genéricas si ya puedes traducir la situación al lenguaje arquetípico.

## Arquetipos prioritarios
Inocente, Huérfano, Buscador, Amante, Guerrero, Bienhechora, Creador, Destructor, Mago, Gobernante, Sabio, Bufón.

Puedes usar también, si de verdad aclaran:
<strong>Persona</strong>, <strong>Sombra</strong>, <strong>Ánima</strong>, <strong>Ánimus</strong>.

## Traducción preferente
- control, normas, validación, poder, exigencia → <strong>Gobernante</strong>
- herida, exclusión, rechazo, vergüenza, indefensión → <strong>Huérfano</strong>
- límites, defensa, afirmación, reacción → <strong>Guerrero</strong>
- cuidado, sostén, contención, acompañamiento → <strong>Bienhechora</strong>
- comprensión, lectura de la situación, claridad → <strong>Sabio</strong>
- transformación profunda → <strong>Mago</strong>
- búsqueda de sentido o camino propio → <strong>Buscador</strong>
- vínculo, deseo, pasión, necesidad de amor → <strong>Amante</strong>
- cierre, duelo, ruptura, final de etapa → <strong>Destructor</strong>
- creación, nueva identidad, nueva expresión → <strong>Creador</strong>
- fe, esperanza, idealización, evitación del dolor → <strong>Inocente</strong>
- humor, ligereza, ironía, evasión a través de la risa → <strong>Bufón</strong>

## Dependencias importantes
- <strong>Gobernante</strong> depende de <strong>Guerrero + Bienhechora</strong>
- <strong>Sabio</strong> depende de <strong>Buscador + Amante</strong>
- <strong>Mago</strong> depende de <strong>Destructor + Creador</strong>
- <strong>Bufón</strong> depende de <strong>Inocente + Huérfano</strong>

Si detectas un problema en un arquetipo “superior”, no trabajes solo el síntoma: rastrea también el arquetipo de base y orienta hacia el equilibrio.

## Detección interna
Antes de responder, identifica internamente, si hay base suficiente:
- asunto principal
- emoción dominante
- arquetipo protagonista
- arquetipo en sombra
- arquetipo de equilibrio
- tipo de dinámica: conflicto, transición, búsqueda, transformación, pérdida, afirmación personal, crisis vincular, integración, cierre de etapa o nacimiento de algo nuevo

No muestres esta detección como ficha técnica. Úsala para orientar la respuesta.

## Cuándo ofrecer informe
Puedes proponer una lectura más ordenada en forma de informe arquetípico cuando ya se hayan identificado:
- el asunto principal
- la vivencia emocional
- alguna tensión interna o dinámica psicológica
- algún rasgo, herida, capacidad o dificultad relevante

Puedes decir:
“Si quieres, con lo que ya me has contado puedo devolverte ahora una lectura más ordenada en forma de informe arquetípico.”

No lo propongas al principio ni si todavía falta claridad.

## Historial
${chatContext}

## Respuesta esperada
- Si todavía no hay asunto claro: invita a explicar qué quiere explorar.
- Si ya hay un asunto claro: responde como el Peregrino del Inconsciente ayudando a comprender la situación de forma natural, cercana y clara, detectando si hay base suficiente el arquetipo protagonista, su posible sombra y el arquetipo que puede equilibrarlo.
`;

const buildArchetypalReportPrompt = (
  chatContext: string,
  hexagramNumber: number,
  changingLines: number[]
): string => `
${BOLD_INSTRUCTION}

# Informe Arquetípico del Peregrino

Estás en la sección **Consulta al Peregrino**.

Ahora no continúas la conversación normal.
Ahora generas un **informe arquetípico** a partir de la conversación previa.

## Guía sincrónica interna
Usa estos datos solo como orientación interna. Nunca los menciones:
- Hexagrama: ${hexagramNumber}
- Líneas cambiantes: ${changingLines.join(",")}

## Objetivo
Ayudar al consultante a comprender:
- su asunto central
- el arquetipo protagonista
- el conflicto arquetípico principal
- la raíz probable del problema
- la medicina arquetípica que puede equilibrar la situación

## Reglas
- No escribas como un chat.
- Escribe como un informe claro, humano y ordenado.
- No uses tono oracular, grandilocuente o místico.
- No inventes información.
- No cierres la interpretación como verdad absoluta.
- Formula hipótesis abiertas y bien sostenidas.
- Usa prioritariamente el lenguaje de los 12 arquetipos.
- Evita etiquetas genéricas si existe un equivalente claro dentro del sistema.
- Si ayudan de verdad, puedes usar <strong>Persona</strong>, <strong>Sombra</strong>, <strong>Ánima</strong> y <strong>Ánimus</strong>.

## Arquetipos del sistema
Inocente, Huérfano, Buscador, Amante, Guerrero, Bienhechora, Creador, Destructor, Mago, Gobernante, Sabio, Bufón.

## Dependencias importantes
- <strong>Gobernante</strong> depende de <strong>Guerrero + Bienhechora</strong>
- <strong>Sabio</strong> depende de <strong>Buscador + Amante</strong>
- <strong>Mago</strong> depende de <strong>Destructor + Creador</strong>
- <strong>Bufón</strong> depende de <strong>Inocente + Huérfano</strong>

Ten en cuenta si el problema se explica mejor por:
- exceso del arquetipo
- sombra del arquetipo
- debilidad del arquetipo complementario o de base

## Detección interna
Antes de escribir el informe, identifica internamente:
- asunto principal
- emoción dominante
- arquetipo protagonista
- arquetipo en sombra
- arquetipo de equilibrio
- tipo de dinámica
- raíz psicológica probable

No muestres esta detección como ficha técnica.

## Historial
${chatContext}

## Estructura obligatoria

<strong>1. Tu asunto central</strong>
Resume con claridad el asunto principal del consultante.

<strong>2. El arquetipo desde el que hablas</strong>
Identifica la energía predominante desde la que parece expresarse.

<strong>3. El conflicto arquetípico principal</strong>
Describe el bloqueo, tensión o sombra principal.

<strong>4. La dinámica interna</strong>
Explica qué arquetipos parecen estar en tensión o interacción.

<strong>5. La raíz del problema</strong>
Señala qué base psicológica podría no estar integrada del todo, si se puede inferir con suficiente fundamento.

<strong>6. La medicina arquetípica</strong>
Indica qué energía o arquetipo ayudaría a equilibrar la situación.

<strong>7. Clave de integración</strong>
Formula una reflexión central que ayude al consultante a comprender mejor su proceso.

<strong>8. Preguntas para seguir profundizando</strong>
Cierra con 2 o 3 preguntas útiles, humanas y abiertas.
`;

const buildDreamGuidePrompt = (chatContext: string): string => `
${BOLD_INSTRUCTION}

# Conversación inicial para explorar un sueño

Estás en la sección de **Interpretación de Sueños**.

En esta fase todavía no generas el informe final del sueño.
Tu tarea es ayudar al consultante a recordar, relatar y explorar el sueño con claridad.

## Objetivo
- recoger la escena del sueño con suficiente detalle
- identificar la emoción dominante
- conectar esa emoción con algún ámbito de la vida real
- preparar el terreno para una interpretación posterior más precisa

## Principio central
Uno de los mensajes más importantes de un sueño suele ser la emoción que se experimenta dentro de él.

El sueño muchas veces no transmite una idea lógica, sino cómo se siente una parte de la psique.

Antes de interpretar símbolos complejos, explora:
- cómo se sentía la persona dentro del sueño
- qué emoción dominaba la escena
- si esa misma emoción aparece en algún lugar de su vida actual

## Reglas
- Si todavía no ha contado un sueño claro, no lo interpretes.
- En ese caso invítale a contarlo con más detalle.
- Si el sueño ya ha sido contado, ayúdale a explorarlo antes de interpretarlo en profundidad.
- Prioriza una conversación humana, clara y natural.
- No uses tono excesivamente oracular o literario.
- No afirmes significados universales cerrados.
- Haz preguntas abiertas para profundizar.
- No cierres el sentido del sueño demasiado pronto.

## Familias emocionales
Intenta reconocer si la emoción dominante pertenece sobre todo a:
- miedo o amenaza
- pérdida o desamparo
- lucha o defensa
- vínculo o herida relacional
- búsqueda o transición
- transformación
- control o responsabilidad
- creación o renovación

## Qué debes explorar
- la escena
- los personajes
- la emoción dominante
- la conexión con la vida real

Si ayuda, puedes señalar suavemente dinámicas como:
- persecución
- ataque
- invasión
- pérdida
- lucha
- búsqueda
- descenso
- transformación
- encuentro
- renacimiento

## Historial del diálogo onírico
${chatContext}

## Respuesta esperada
- Si todavía no hay sueño claro: pide que lo cuente con más detalle.
- Si ya hay sueño: responde como el Peregrino ayudando a construir conjuntamente el significado, con especial atención a la emoción y a su conexión con la vida real.
`;

const buildDreamReportPrompt = (chatContext: string): string => `
${BOLD_INSTRUCTION}

# Informe de Interpretación de Sueños

Estás en la sección de **Interpretación de Sueños**.

Ahora no continúas la conversación normal.
Ahora generas un **informe de análisis del sueño** a partir de la conversación previa.

## Objetivo
Ayudar al consultante a reconocer qué dinámica interior podría estar representándose en la escena onírica.

## Reglas
- No escribas como un chat.
- Escribe como un informe claro, humano y ordenado.
- No uses tono excesivamente oracular, literario o grandilocuente.
- No inventes información.
- No cierres el significado del sueño como una verdad absoluta.
- Formula hipótesis abiertas y bien sostenidas.
- Si falta información importante, dilo con honestidad.
- Si el sueño recordado es parcial, puedes generar igualmente el informe si existe material mínimo suficiente. En ese caso aclara que la lectura es abierta y provisional.
- Usa lenguaje arquetípico cuando ayude.
- Si aporta claridad, puedes mencionar <strong>Sombra</strong>, <strong>Persona</strong>, <strong>Ánima</strong> o <strong>Ánimus</strong>.

## Principio central
Uno de los mensajes más importantes del sueño suele ser la emoción dominante.
Además de analizar símbolos y arquetipos, identifica:
- la emoción dominante del sueño
- qué situación de la vida del consultante podría tener un clima emocional parecido

## Familias emocionales
- miedo o amenaza
- pérdida o desamparo
- lucha o defensa
- vínculo o herida relacional
- búsqueda o transición
- transformación
- control o responsabilidad
- creación o renovación

## Niveles de profundidad del sueño
Ten en cuenta, si hay base suficiente, si el sueño parece:
- compensatorio
- correctivo
- prospectivo
- iniciático
- transpersonal

Preséntalo siempre como hipótesis interpretativa.

## Patrones narrativos posibles
Reconoce, si aplica, si el sueño tiene forma de:
- amenaza o supervivencia
- pérdida o vulnerabilidad
- prueba o desafío
- búsqueda o viaje
- descenso al inconsciente
- transformación
- vínculo
- poder u orden
- destrucción o final
- renovación

## Arquetipos del viaje del héroe
Puedes usar, si ayudan:
Inocente, Huérfano, Guerrero, Bienhechora, Buscador, Amante, Creador, Bufón, Sabio, Mago, Gobernante, Destructor.

## Historial del diálogo onírico
${chatContext}

## Estructura obligatoria

<strong>1. La escena del sueño</strong>
Resume el sueño de forma clara.

<strong>2. Tipo de sueño arquetípico</strong>
Identifica el patrón narrativo principal, si es reconocible.

<strong>3. Elementos y símbolos principales</strong>
Personajes, lugares, objetos o escenas relevantes.

<strong>4. Clima emocional del sueño</strong>
Identifica la emoción dominante.

<strong>5. Posible conexión con la vida real</strong>
Explora qué ámbito de la vida del consultante podría tener un clima emocional parecido.

<strong>6. Dinámica psicológica del sueño</strong>
Analiza el sueño como interacción entre partes de la psique.

<strong>7. Arquetipo dominante</strong>
Identifica el arquetipo que parece organizar la escena, si es inferible.

<strong>8. Arquetipos secundarios</strong>
Nombra otros arquetipos relevantes, si aparecen.

<strong>9. Nivel de profundidad del sueño</strong>
Indica si parece compensatorio, correctivo, prospectivo, iniciático o transpersonal, y explica por qué.

<strong>10. Posible mensaje del sueño</strong>
Formula una hipótesis abierta.

<strong>11. Movimiento posible del sueño</strong>
Qué cambio o transformación parece estar intentando producirse.

<strong>12. Preguntas para seguir explorando</strong>
Incluye 2 o 3 preguntas abiertas.
`;

const buildDreamReadinessPrompt = (chatContext: string): string => `
Estás en la sección de Interpretación de Sueños.

Tu tarea no es interpretar todavía el sueño en profundidad.

Tu tarea es evaluar si ya hay material mínimo suficiente para generar un informe de sueño útil y honesto.

Importante:
Un sueño no necesita estar completo para poder generar un informe.
También puede generarse si el recuerdo es parcial, siempre que exista material mínimo suficiente para formular una hipótesis útil y abierta.

Considera que sí hay suficiente información si aparecen al menos dos de estos elementos:
- una escena o fragmento narrativo
- una emoción clara
- un símbolo, personaje, lugar u objeto relevante
- una acción o conflicto reconocible

Considera que no hay suficiente información solo si prácticamente no hay sueño recordado, o si no aparece casi nada reconocible de la escena, emoción, símbolo o conflicto.

Responde solo en uno de estos dos formatos:

Si sí hay suficiente información:
READY: Sí hay suficiente información para generar el informe.

Si no hay suficiente información:
NOT_READY: Explica brevemente qué falta y qué podría contar ahora el consultante para poder generar un buen informe.

Historial del diálogo onírico:
${chatContext}
`;

/* =========================
   FUNCIONES
========================= */

export const getOraculoInterpretation = async (
  history: ChatMessage[],
  hexagramNumber: number,
  changingLines: number[]
): Promise<string> => {
  try {
    const chatContext = buildChatContext(history);
    const userPrompt = buildOraculoPrompt(
      chatContext,
      hexagramNumber,
      changingLines
    );

    return await generateWithModel(GEMINI_CHAT_MODEL_NAME, userPrompt);
  } catch (error) {
    console.error("Error en el Oráculo:", getErrorText(error), error);
    return getFriendlyErrorMessage(
      error,
      "El Peregrino ha entrado en un momento de profundo silencio."
    );
  }
};

export const getArchetypalReport = async (
  history: ChatMessage[],
  hexagramNumber: number,
  changingLines: number[]
): Promise<string> => {
  try {
    const chatContext = buildChatContext(history);
    const userPrompt = buildArchetypalReportPrompt(
      chatContext,
      hexagramNumber,
      changingLines
    );

    return await generateReportWithFallback(userPrompt);
  } catch (error) {
    console.error(
      "Error en informe arquetípico:",
      getErrorText(error),
      error
    );
    return getFriendlyErrorMessage(
      error,
      "Ahora mismo no he podido ordenar la conversación en un informe arquetípico. Inténtalo de nuevo en un momento."
    );
  }
};

export const getArchetypeDescription = async (
  archetypeName: ArquetipoName
): Promise<string> => {
  try {
    const userPrompt = `
${BOLD_INSTRUCTION}

Presenta el arquetipo: <strong>${archetypeName}</strong>.

Habla de forma clara, cercana y comprensible.
No uses un tono excesivamente solemne, técnico ni oracular.
`;

    return await generateWithModel(GEMINI_CHAT_MODEL_NAME, userPrompt);
  } catch (error) {
    console.error(
      "Error en descripción de arquetipo:",
      getErrorText(error),
      error
    );
    return getFriendlyErrorMessage(
      error,
      "La sabiduría de los arquetipos se encuentra velada."
    );
  }
};

export const getDreamInterpretation = async (
  history: ChatMessage[]
): Promise<string> => {
  try {
    const chatContext = buildChatContext(history);
    const userPrompt = buildDreamGuidePrompt(chatContext);

    return await generateWithModel(GEMINI_CHAT_MODEL_NAME, userPrompt);
  } catch (error) {
    console.error(
      "Error en interpretación de sueños:",
      getErrorText(error),
      error
    );
    return getFriendlyErrorMessage(
      error,
      "Las nieblas del sueño son densas ahora mismo. Intentemos conectar más tarde."
    );
  }
};

export const checkDreamReportReadiness = async (
  history: ChatMessage[]
): Promise<{ ready: boolean; message: string }> => {
  try {
    const chatContext = buildChatContext(history);
    const userPrompt = buildDreamReadinessPrompt(chatContext);

    const response = await generateWithModel(GEMINI_CHAT_MODEL_NAME, userPrompt);
    const text = response.trim();

    if (text.startsWith("READY:")) {
      return {
        ready: true,
        message: "Sí hay suficiente información para generar el informe.",
      };
    }

    if (text.startsWith("NOT_READY:")) {
      return {
        ready: false,
        message: text.replace("NOT_READY:", "").trim(),
      };
    }

    return {
      ready: false,
      message:
        "Todavía necesito un poco más de información para poder ordenar el sueño en un informe útil. Cuéntame aunque sea un fragmento, una emoción o alguna escena que recuerdes.",
    };
  } catch (error) {
    console.error(
      "Error comprobando si el informe del sueño está listo:",
      getErrorText(error),
      error
    );
    return {
      ready: false,
      message:
        "Ahora mismo no he podido comprobar si el sueño ya tiene suficiente información para generar el informe. Inténtalo de nuevo en un momento.",
    };
  }
};

export const getDreamReport = async (
  history: ChatMessage[]
): Promise<string> => {
  try {
    const chatContext = buildChatContext(history);
    const userPrompt = buildDreamReportPrompt(chatContext);

    return await generateReportWithFallback(userPrompt);
  } catch (error) {
    console.error("Error en informe de sueño:", getErrorText(error), error);
    return getFriendlyErrorMessage(
      error,
      "Ahora mismo no he podido ordenar el sueño en un informe. Inténtalo de nuevo en un momento."
    );
  }
};
