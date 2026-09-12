import { searchNizaClasses, NizaClass } from "./niza";

export const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  is_local_py: boolean;
  is_com_py: boolean;
  domain: string;
}

export interface BrandWebReport {
  brand_name: string;
  query_used: string;
  has_live_api: boolean;
  total_results: number;
  results: WebSearchResult[];
  py_presence_detected: boolean;
  py_domain_count: number;
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
        py_domain_count: 0,
        social_profiles: [],
        detected_activities: [],
        suggested_niza_classes: [],
        summary: "Sin clave de API de Tavily configurada. Agrega TAVILY_API_KEY en .env para búsqueda web en tiempo real."
      };
    }

    // 1. Estrategia primaria: Acotar específicamente a dominios .com.py y .py de Paraguay
    const primaryQuery = categoryHint
      ? `"${cleanBrand}" (site:.com.py OR site:.py) ${categoryHint}`
      : `"${cleanBrand}" (site:.com.py OR site:.py)`;

    try {
      let activeQuery = primaryQuery;
      let data = await this.executeTavilyQuery(primaryQuery);
      let rawResults = data?.results || [];

      // 2. Si no hay resultados en .com.py/.py, fallback a búsqueda comercial en Paraguay (redes, .com locales, etc.)
      if (rawResults.length === 0) {
        const fallbackQuery = categoryHint
          ? `"${cleanBrand}" Paraguay ${categoryHint}`
          : `"${cleanBrand}" Paraguay marca comercio empresa`;
        activeQuery = fallbackQuery;
        data = await this.executeTavilyQuery(fallbackQuery);
        rawResults = data?.results || [];
      }

      const answer = data?.answer || "";
      const results: WebSearchResult[] = [];
      let pyDetected = false;
      let pyDomainCount = 0;
      const socialProfiles: Array<{ platform: string; url: string }> = [];
      const allTextChunks: string[] = [];

      const GENERIC_EXCLUDES = [
        "scholar.google.",
        "books.google.",
        "ubuy.",
        "aliexpress.",
        "amazon.",
        "ebay.",
        "tiendamia."
      ];

      const brandLower = cleanBrand.toLowerCase();
      const brandRegex = new RegExp(`\\b${brandLower.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}\\b`, "i");

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

        // Ignorar sitios agregadores mundiales que no representan negocios locales
        if (GENERIC_EXCLUDES.some(ex => domain.includes(ex))) {
          continue;
        }

        const titleLower = title.toLowerCase();
        const contentLower = content.toLowerCase();
        const fullText = titleLower + " " + contentLower;

        // Validar que la marca aparezca explícitamente en el contenido o título
        const brandInText = brandRegex.test(fullText);
        if (!brandInText) {
          continue;
        }

        // Si el score de Tavily es marginal y la marca no está en el título, es ruido
        const brandInTitle = brandRegex.test(titleLower);
        if (score < 0.15 && !brandInTitle) {
          continue;
        }

        const isComPy = domain.endsWith(".com.py");
        const isPy =
          domain.endsWith(".py") ||
          isComPy ||
          contentLower.includes("paraguay") ||
          titleLower.includes("paraguay") ||
          contentLower.includes("asunción") ||
          contentLower.includes("asuncion");

        if (isPy) {
          pyDetected = true;
        }
        if (domain.endsWith(".py") || isComPy) {
          pyDomainCount++;
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
          is_com_py: isComPy,
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
          summaryText = `No se encontraron menciones en dominios .com.py ni en internet para "${cleanBrand}" en Paraguay.`;
        } else if (pyDomainCount > 0) {
          summaryText = `Se detectó presencia activa en ${pyDomainCount} dominio(s) paraguayo(s) (.com.py / .py) para "${cleanBrand}".`;
        } else if (pyDetected) {
          summaryText = `Se detectó presencia comercial activa con indicios de actividad en Paraguay para "${cleanBrand}".`;
        } else {
          summaryText = `Se encontraron resultados para "${cleanBrand}", pero sin vínculo comercial confirmado con Paraguay.`;
        }
      }

      return {
        brand_name: cleanBrand,
        query_used: activeQuery,
        has_live_api: true,
        total_results: results.length,
        results,
        py_presence_detected: pyDetected,
        py_domain_count: pyDomainCount,
        social_profiles: socialProfiles,
        detected_activities: [],
        suggested_niza_classes: suggestedNiza,
        summary: summaryText
      };
    } catch (err: any) {
      return {
        brand_name: cleanBrand,
        query_used: primaryQuery,
        has_live_api: false,
        total_results: 0,
        results: [],
        py_presence_detected: false,
        py_domain_count: 0,
        social_profiles: [],
        detected_activities: [],
        suggested_niza_classes: [],
        summary: `Error al consultar Tavily: ${err.message}`
      };
    }
  }

  private async executeTavilyQuery(query: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
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

      if (!resp.ok) {
        return null;
      }

      return await resp.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
