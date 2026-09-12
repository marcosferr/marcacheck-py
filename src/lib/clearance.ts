import { DINAPIClient, DINAPIRecord, DINAPISearchResult } from "./dinapi";
import { TavilyBrandResearcher, BrandWebReport } from "./tavily";
import { getNizaClass, NizaClass } from "./niza";

export interface ClearanceVerdict {
  risk_level: "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO";
  risk_color: "green" | "yellow" | "orange" | "red";
  risk_score: number;          // 0 a 100
  viability_score: number;     // 100 - risk_score
  headline: string;
  legal_basis: string[];
  blocking_records: DINAPIRecord[];
  related_records: DINAPIRecord[];
  web_findings: {
    has_live_api: boolean;
    py_detected: boolean;
    total_results: number;
    summary: string;
    social_profiles: Array<{ platform: string; url: string }>;
    suggested_niza: Array<{ number: number; title: string; category: string }>;
  };
  recommendations: string[];
}

export interface InvestigationReport {
  brand_name: string;
  target_class?: number;
  class_info?: {
    number: number;
    category: string;
    title: string;
    description: string;
    related_classes: number[];
  };
  dinapi_summary: {
    total_found: number;
    is_truncated: boolean;
    total_potential: number;
    records: DINAPIRecord[];
  };
  web_summary: BrandWebReport;
  verdict: ClearanceVerdict;
  timestamp: string;
}

export class BrandClearanceEngine {
  private dinapi: DINAPIClient;
  private tavily: TavilyBrandResearcher;

  constructor(dinapiClient?: DINAPIClient, tavilyResearcher?: TavilyBrandResearcher) {
    this.dinapi = dinapiClient || new DINAPIClient();
    this.tavily = tavilyResearcher || new TavilyBrandResearcher();
  }

  async investigate(params: {
    brandName: string;
    niceClass?: number;
    categoryHint?: string;
    maxDinapiResults?: number;
  }): Promise<InvestigationReport> {
    const { brandName, niceClass, categoryHint, maxDinapiResults = 60 } = params;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

    // 1. Obtener información de la Clase Niza
    let classInfo: InvestigationReport["class_info"] | undefined = undefined;
    let targetClassObj: NizaClass | null = null;
    if (niceClass) {
      targetClassObj = getNizaClass(niceClass);
      if (targetClassObj) {
        classInfo = {
          number: targetClassObj.number,
          category: targetClassObj.category,
          title: targetClassObj.title,
          description: targetClassObj.description,
          related_classes: targetClassObj.related_classes
        };
      }
    }

    // 2. Consultar DINAPI y Tavily en paralelo para máxima velocidad
    const catForWeb = categoryHint || (targetClassObj ? targetClassObj.title : "");

    const [dinapiRes, webReport] = await Promise.all([
      this.dinapi.searchComprehensive(brandName, niceClass, maxDinapiResults),
      this.tavily.researchBrand(brandName, catForWeb)
    ]);

    // Revisar antecedentes en clases afines si se especificó clase
    const relatedClassRecords: DINAPIRecord[] = [];
    if (targetClassObj && targetClassObj.related_classes.length > 0) {
      const topRelated = targetClassObj.related_classes.slice(0, 2);
      await Promise.all(
        topRelated.map(async (relCls) => {
          try {
            const relRes = await this.dinapi.searchContains(brandName, relCls);
            for (const r of relRes) {
              if (r.similarity_score >= 60.0) {
                relatedClassRecords.push(r);
              }
            }
          } catch {
            // Ignorar errores en clases secundarias
          }
        })
      );
    }

    // 3. Evaluar riesgo y emitir dictamen
    const verdict = this.evaluateRisk(
      brandName,
      niceClass,
      dinapiRes.records,
      relatedClassRecords,
      webReport
    );

    return {
      brand_name: brandName,
      target_class: niceClass,
      class_info: classInfo,
      dinapi_summary: {
        total_found: dinapiRes.total_found,
        is_truncated: dinapiRes.is_truncated,
        total_potential: dinapiRes.total_potential_in_database,
        records: dinapiRes.records
      },
      web_summary: webReport,
      verdict: verdict,
      timestamp: nowStr
    };
  }

  private evaluateRisk(
    brandName: string,
    targetClass: number | undefined,
    dinapiRecords: DINAPIRecord[],
    relatedRecords: DINAPIRecord[],
    webReport: BrandWebReport
  ): ClearanceVerdict {
    let riskScore = 0;
    const blocking: DINAPIRecord[] = [];
    const related: DINAPIRecord[] = [];
    const legalBasis: string[] = [];
    const recommendations: string[] = [];

    let hasIdenticalActive = false;
    let hasHighSimilarity = false;
    let hasPendingApplication = false;

    for (const r of dinapiRecords) {
      if (r.similarity_score >= 95.0) {
        if (r.is_granted) {
          hasIdenticalActive = true;
          blocking.push(r);
        } else if (r.is_pending) {
          hasPendingApplication = true;
          blocking.push(r);
        } else {
          related.push(r);
        }
      } else if (r.similarity_score >= 70.0) {
        if (r.is_active) {
          hasHighSimilarity = true;
          blocking.push(r);
        } else {
          related.push(r);
        }
      } else if (r.similarity_score >= 45.0) {
        related.push(r);
      }
    }

    for (const r of relatedRecords) {
      if (r.is_active && r.similarity_score >= 65.0) {
        related.push(r);
      }
    }

    let headline = "";

    if (hasIdenticalActive) {
      riskScore = Math.max(riskScore, 95);
      legalBasis.push("Art. 2 Inc. a) Ley 1294/98: No pueden registrarse signos idénticos a otros ya registrados para los mismos productos o servicios.");
      headline = `Riesgo CRÍTICO: La denominación "${brandName}" ya se encuentra registrada y concedida en DINAPI a nombre de un tercero.`;
      recommendations.push("No se aconseja presentar la solicitud en la forma actual debido a un obstáculo insalvable de identidad.");
      recommendations.push("Evaluar una denominación sustancialmente distintiva o verificar si el registro vigente es susceptible de caducidad por falta de uso (Art. 27 Ley 1294/98).");
    } else if (hasPendingApplication) {
      riskScore = Math.max(riskScore, 85);
      legalBasis.push("Principio de Prioridad Registral: Existe una solicitud previa en trámite en DINAPI que confiere prelación a su solicitante.");
      headline = `Riesgo ALTO: Existe una solicitud prioritaria en trámite en DINAPI para un signo idéntico.`;
      recommendations.push("Monitorear el trámite de la solicitud prioritaria para verificar si es concedida o denegada.");
      recommendations.push("Considerar la adopción de un elemento gráfico o denominativo complementario que diferencie claramente el signo.");
    } else if (hasHighSimilarity) {
      riskScore = Math.max(riskScore, 70);
      legalBasis.push("Art. 2 Inc. b) Ley 1294/98: Prohíbe signos semejantes que puedan inducir a confusión o asociación en el público consumidor.");
      headline = `Riesgo ALTO: Se detectaron antecedentes en DINAPI con alta similitud fonética o gráfica.`;
      recommendations.push("Presentar la marca combinada con un diseño o logotipo fuertemente distintivo (marca mixta).");
      recommendations.push("Delimitar con precisión los productos o servicios específicos para minimizar el riesgo de oposición.");
    } else {
      if (related.length > 0) {
        riskScore = Math.max(riskScore, 35);
        headline = `Riesgo MEDIO-BAJO: No se hallaron marcas idénticas concedidas, aunque existen signos con similitud parcial.`;
        recommendations.push("La denominación cuenta con viabilidad registral preliminar en DINAPI.");
        recommendations.push("Se recomienda acompañar el registro con una adecuada reivindicación de elementos mixtos o gráficos.");
      } else {
        riskScore = 10;
        headline = `Riesgo BAJO: La denominación "${brandName}" no registra impedimentos directos en DINAPI.`;
        recommendations.push("Excelente disponibilidad marcaria en los registros oficiales de la DINAPI.");
        recommendations.push("Proceder con la presentación de la solicitud formal para asegurar la prioridad temporal de registro.");
      }
    }

    if (webReport.py_presence_detected) {
      if (riskScore < 70) {
        riskScore = Math.min(80, riskScore + 25);
      }
      headline += " Se detectó además presencia comercial activa en la web local.";
      legalBasis.push("Doctrina de Marca de Hecho / Uso Previo: La existencia de un comercio preexistente en el mercado paraguayo puede facultar al usuario anterior a deducir oposición.");
      recommendations.push("Investigar la identidad del negocio detectado en internet para descartar conflicto de uso de hecho o titularidad.");
    }

    if (webReport.social_profiles.length > 0) {
      recommendations.push(`Se identificaron perfiles en redes sociales vinculados (${webReport.social_profiles.map(p => p.platform).slice(0, 3).join(", ")}).`);
    }

    let level: "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO";
    let color: "green" | "yellow" | "orange" | "red";

    if (riskScore >= 85) {
      level = "CRÍTICO";
      color = "red";
    } else if (riskScore >= 65) {
      level = "ALTO";
      color = "orange";
    } else if (riskScore >= 35) {
      level = "MEDIO";
      color = "yellow";
    } else {
      level = "BAJO";
      color = "green";
    }

    const viabilityScore = Math.max(0, 100 - riskScore);

    return {
      risk_level: level,
      risk_color: color,
      risk_score: riskScore,
      viability_score: viabilityScore,
      headline,
      legal_basis: legalBasis,
      blocking_records: blocking.slice(0, 10),
      related_records: related.slice(0, 15),
      web_findings: {
        has_live_api: webReport.has_live_api,
        py_detected: webReport.py_presence_detected,
        total_results: webReport.total_results,
        summary: webReport.summary,
        social_profiles: webReport.social_profiles,
        suggested_niza: webReport.suggested_niza_classes
      },
      recommendations
    };
  }
}
