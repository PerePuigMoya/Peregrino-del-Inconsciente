
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, AI_PERSONA_PEREGRINO } from '../constants';
import { ArquetipoName, ARQUETIPOS, ChatMessage } from "../types";

const getAIClient = () => {
  // Vite inyectará tu clave directamente aquí al compilar
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

export const getOraculoInterpretation = async (
  userQuestion: string,
  hexagramNumber: number,
  changingLines: number[]
): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
${AI_PERSONA_PEREGRINO}
${BOLD_INSTRUCTION}

Tarea: Analiza la consulta y determina la dinámica arquetípica. Usa los datos técnicos internos (Hexagrama ${hexagramNumber}, Líneas ${changingLines.join(',')}) solo como guía de energía, pero no los nombres.

Pregunta del usuario: "${userQuestion}"

Estructura de respuesta obligatoria:
1. <strong>La Voz que Pregunta</strong>: Identifica desde qué arquetipo está hablando el consultante.
2. <strong>El Arquetipo en la Sombra</strong>: Describe el bloqueo o desafío actual.
3. <strong>La Medicina Arquetípica</strong>: Indica qué OTRO arquetipo es necesario para equilibrar.
4. <strong>Acción Simbólica</strong>: Sugerencia práctica.
5. <strong>Pregunta de Reflexión</strong>.

Firma como "Peregrino del Inconsciente".
`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error en el Oráculo:", error);
    return "El Peregrino ha entrado en un momento de profundo silencio.";
  }
};

export const getArchetypeDescription = async (archetypeName: ArquetipoName): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
${AI_PERSONA_PEREGRINO}
Presenta el arquetipo: <strong>${archetypeName}</strong>.
${BOLD_INSTRUCTION}
`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "La sabiduría de los arquetipos se encuentra velada.";
  }
};

export const getDreamInterpretation = async (history: ChatMessage[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const chatContext = history.map(m => `${m.sender === 'user' ? 'Consultante' : 'Peregrino'}: ${m.text}`).join('\n');
    
    const prompt = `
${AI_PERSONA_PEREGRINO}
${BOLD_INSTRUCTION}

Estás analizando un sueño. 
Si es el primer mensaje, identifica arquetipos y símbolos, y haz preguntas sobre la subjetividad de los mismos.
Si es una respuesta del consultante sobre sus sentimientos o significados, integra esa información para dar una conclusión más profunda sobre el mensaje del sueño.

Historial del diálogo onírico:
${chatContext}

Responde como el Peregrino, manteniendo el enfoque en la construcción mutua del significado.
`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error en interpretación de sueños:", error);
    return "Las nieblas del sueño son densas ahora mismo. Intentemos conectar más tarde.";
  }
};
