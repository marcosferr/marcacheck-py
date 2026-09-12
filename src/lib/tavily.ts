import { searchNizaClasses, NizaClass } from "./niza";

export const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  is_local_py: boolean;
  domain: string;
}

export interface BrandWebReport {
  brand_name: string;
  query_used: string;
  has_live_api: boolean;
  total_results: number;
  results: WebSearchResult[];
  py_presence_detected: boolean;
  social_profiles: Array<{ platform: string; url: string }>;
  detected_activities: string[];
  suggested_niza_classes: Array<{ number: number; title: string; category: string }>;
  summary: string;
}

export class TavilyBrandResearcher {
  private apiKey: string;
  private timeoutMs: number;

  constructor(apiKey?: string, timeoutSeconds: number = 15) {
    this.apiKey = (apiKey || process.env.TAVILY_API_KEY || "").trim();
    this.timeoutMs = timeoutSeconds * 1000;
  }

  async researchBrand(brandName: string, categoryHint: string = ""): Promise<BrandWebReport> {
    const cleanBrand = brandName.trim();

    if (!this.apiKey) {
      return {
        brand_name: cleanBrand,
        query_used: "",
        has_live_api: false,
        total_results: 0,
        results: [],
        py_presence_detected: false,
        social_profiles: [],
        detected_activities: [],
        suggested_niza_classes: [],
        summary: "Sin clave de API de Tavily configurada. Agrega TAVILY_API_KEY en .env para búsqueda web en tiempo real."
      };
    }

    // Estrategia de query dirigida a Paraguay y uso comercial
    const query = categoryHint
      ? `"${cleanBrand}" Paraguay ${categoryHint}`
      : `"${cleanBrand}" Paraguay marca comercio empresa`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const resp = await fetch(TAVILY_SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: query,
          search_depth: "advanced",
          include_answer: true,
          max_results: 8
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errText = await resp.text();
        return {
          brand_name: cleanBrand,
          query_used: query,
          has_live_api: false,
          total_results: 0,
          results: [],
          py_presence_detected: false,
          social_profiles: [],
          detected_activities: [],
          suggested_niza_classes: [],
          summary: `Error de respuesta Tavily (${resp.status}): ${errText.slice(0, 150)}`
        };
      }

      const data = await resp.json();
      const rawResults = data.results || [];
      const answer = data.answer || "";

      const results: WebSearchResult[] = [];
      let pyDetected = false;
      const socialProfiles: Array<{ platform: string; url: string }> = [];
      const allTextChunks: string[] = [];

      for (const item of rawResults) {
        const url = String(item.url || "");
        const title = String(item.title || "");
        const content = String(item.content || "");
        const score = typeof item.score === "number" ? item.score : 0;

        let domain = "";
        try {
          domain = new URL(url).hostname.toLowerCase();
        } catch {
          domain = "";
        }

        const isPy =
          domain.endsWith(".py") ||
          content.toLowerCase().includes("paraguay") ||
          title.toLowerCase().includes("paraguay") ||
          content.toLowerCase().includes("asunción") ||
          content.toLowerCase().includes("asuncion");

        if (isPy) {
          pyDetected = true;
        }

        // Redes sociales
        if (domain.includes("instagram.com")) {
          socialProfiles.push({ platform: "Instagram", url });
        } else if (domain.includes("facebook.com")) {
          socialProfiles.push({ platform: "Facebook", url });
        } else if (domain.includes("linkedin.com")) {
          socialProfiles.push({ platform: "LinkedIn", url });
        } else if (domain.includes("twitter.com") || domain.includes("x.com")) {
          socialProfiles.push({ platform: "X / Twitter", url });
        }

        allTextChunks.push(title, content);

        results.push({
          title,
          url,
          content,
          score,
          is_local_py: isPy,
          domain
        });
      }

      // Detectar clases Niza sugeridas según el texto hallado
      const combinedText = allTextChunks.join(" ");
      const suggestedClassesMap = new Map<number, NizaClass>();
      const sampleWords = combinedText.split(/\s+/).slice(0, 80);

      for (const w of sampleWords) {
        if (w.length >= 4) {
          const matched = searchNizaClasses(w, 2);
          for (const m of matched) {
            suggestedClassesMap.set(m.number, m);
          }
        }
      }

      const suggestedNiza = Array.from(suggestedClassesMap.values())
        .slice(0, 4)
        .map(c => ({
          number: c.number,
          title: c.title,
          category: c.category
        }));

      // Resumen
      let summaryText = answer;
      if (!summaryText) {
        if (results.length === 0) {
          summaryText = `No se encontraron menciones comerciales relevantes en internet para "${cleanBrand}" asociadas a Paraguay.`;
        } else if (pyDetected) {
          summaryText = `Se detectó presencia web activa con indicios de actividad comercial local en Paraguay para "${cleanBrand}".`;
        } else {
          summaryText = `Se encontraron resultados web globales para "${cleanBrand}", pero sin vínculo específico o directo confirmado con el mercado de Paraguay.`;
        }
      }

      return {
        brand_name: cleanBrand,
        query_used: query,
        has_live_api: true,
        total_results: results.length,
        results,
        py_presence_detected: pyDetected,
        social_profiles: socialProfiles,
        detected_activities: [],
        suggested_niza_classes: suggestedNiza,
        summary: summaryText
      };
    } catch (err: any) {
      return {
        brand_name: cleanBrand,
        query_used: query,
        has_live_api: false,
        total_results: 0,
        results: [],
        py_presence_detected: false,
        social_profiles: [],
        detected_activities: [],
        suggested_niza_classes: [],
        summary: `Error al consultar Tavily: ${err.message}`
      };
    }
  }
}
