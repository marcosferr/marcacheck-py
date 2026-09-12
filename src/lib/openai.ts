import { InvestigationReport } from "./clearance";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const DEFAULT_OPENAI_MODEL = "gpt-5-mini";

export const PARAGUAY_LEGAL_SYSTEM_PROMPT = `Eres el Asesor Especialista en Propiedad Intelectual y Derecho de Marcas de "MarcaCheck PY", experto en la legislación marcaria de la República del Paraguay (Ley N° 1294/98 "De Marcas", Decretos Reglamentarios, directrices de la DINAPI y convenios OMPI/París).

Tus funciones y directrices:
1. **Rigor Jurídico y Práctico:** Brindas dictámenes, análisis de viabilidad, consejos estratégicos y explicaciones claras tanto a abogados como a emprendedores y empresas.
2. **Marco Normativo Paraguayo:**
   - **Art. 1 Ley 1294/98:** Concepto de marcas (signos distintivos para productos y servicios).
   - **Art. 2 Ley 1294/98:** Prohibiciones absolutas y relativas (signos idénticos o semejantes susceptibles de causar confusión o asociación; nombres genéricos, descriptivos, engañosos, etc.).
   - **Principio de Especialidad:** Las marcas se protegen para las clases y productos/servicios específicos solicitados (Clasificación de Niza), salvo notoriedad (Art. 2 Inc. k).
   - **Procedimiento DINAPI:** Solicitud formal, examen de forma, publicación en la Gaceta Oficial, plazo de 60 días hábiles para oposiciones de terceros (Art. 16), examen de fondo y concesión (vigencia por 10 años renovables indefinidamente).
   - **Caducidad por falta de uso:** Art. 27 Ley 1294/98 (5 años sin uso ininterrumpido).
3. **Uso del Contexto:** Si el usuario tiene una investigación en curso o te comparte los antecedentes de DINAPI y Tavily, utiliza activamente esos datos para dar una respuesta personalizada: cita los números de solicitud/registro, las clases Niza pertinentes, el riesgo de confusión fonética y las alternativas de protección (ej. marca mixta con imagotipo, delimitación de productos).
4. **Tono Profesional y Resolutivo:** Sé cortés, constructivo, directo y ofrece pasos claros a seguir. Si recomiendas registrar, sugiere la clase adecuada y cómo preparar la solicitud ante la DINAPI.`;

export function formatInvestigationContext(report: InvestigationReport): string {
  const blockingStr = report.verdict.blocking_records.length > 0
    ? report.verdict.blocking_records.map(r =>
        `- "${r.title}" (Clase ${r.nice_class}, Estado: ${r.status}, Titular: ${r.owner}, Similitud: ${r.similarity_score}%, Solicitud: ${r.file_number}, Registro: ${r.registration_number})`
      ).join("\n")
    : "Ningún antecedente idéntico o crítico directo.";

  const relatedStr = report.verdict.related_records.length > 0
    ? report.verdict.related_records.slice(0, 5).map(r =>
        `- "${r.title}" (Clase ${r.nice_class}, Estado: ${r.status}, Titular: ${r.owner}, Similitud: ${r.similarity_score}%)`
      ).join("\n")
    : "No se encontraron otros signos semejantes.";

  return `[CONTEXTO DE LA INVESTIGACIÓN ACTUAL]
- Marca investigada: "${report.brand_name}"
- Clase Niza analizada: ${report.target_class ? `Clase ${report.target_class} (${report.class_info?.title || ""})` : "General (sin clase restringida)"}
- Dictamen de Viabilidad: ${report.verdict.risk_level} (Score de Riesgo: ${report.verdict.risk_score}%, Viabilidad: ${report.verdict.viability_score}%)
- Resumen: ${report.verdict.headline}
- Antecedentes directos/bloqueantes en DINAPI:
${blockingStr}
- Antecedentes semejantes o en clases afines:
${relatedStr}
- Inteligencia web (Tavily):
  * Presencia en Paraguay detectada: ${report.web_summary.py_presence_detected ? "SÍ" : "NO"}
  * Total resultados web: ${report.web_summary.total_results}
  * Resumen web: ${report.web_summary.summary}
  * Perfiles en redes: ${report.web_summary.social_profiles.map(s => `${s.platform} (${s.url})`).join(", ") || "Ninguno"}
[FIN DEL CONTEXTO]`;
}

export async function askOpenAI(params: {
  messages: ChatMessage[];
  investigationReport?: InvestigationReport;
  apiKey?: string;
  model?: string;
}): Promise<string> {
  const key = (params.apiKey || process.env.OPENAI_API_KEY || "").trim();

  if (!key) {
    throw new Error(
      "No se encontró la clave de API de OpenAI. Por favor ingresa tu OPENAI_API_KEY en la configuración o en el archivo .env."
    );
  }

  const model = params.model || DEFAULT_OPENAI_MODEL;

  const systemMessages: ChatMessage[] = [
    { role: "system", content: PARAGUAY_LEGAL_SYSTEM_PROMPT }
  ];

  if (params.investigationReport) {
    systemMessages.push({
      role: "system",
      content: formatInvestigationContext(params.investigationReport)
    });
  }

  const payloadMessages = [...systemMessages, ...params.messages];

  // Build payload with support for newer models (max_completion_tokens)
  const bodyPayload: Record<string, any> = {
    model: model,
    messages: payloadMessages,
  };

  // Many newer OpenAI models (o1/o3/gpt-5) require max_completion_tokens and reject max_tokens or non-default temperature
  if (model.startsWith("o1") || model.startsWith("o3") || model.includes("gpt-5")) {
    bodyPayload.max_completion_tokens = 2000;
  } else {
    bodyPayload.temperature = 0.7;
    bodyPayload.max_tokens = 1500;
  }

  let response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(bodyPayload)
  });

  // If failed with unsupported parameter max_tokens, retry with max_completion_tokens
  if (!response.ok) {
    const errorBody = await response.text();
    if (errorBody.includes("max_tokens") || errorBody.includes("temperature")) {
      delete bodyPayload.max_tokens;
      delete bodyPayload.temperature;
      bodyPayload.max_completion_tokens = 2000;

      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify(bodyPayload)
      });
    } else {
      throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  if (!choice || !choice.message?.content) {
    throw new Error("No se recibió respuesta válida del modelo de OpenAI.");
  }

  return choice.message.content;
}
