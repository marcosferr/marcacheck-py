import https from "node:https";
import { normalizeMarkName, trademarkSimilarityScore } from "./phonetics";

export const DINAPI_BASE_URL = "https://joaju.dinapi.gov.py/api/api/markMarkGetList-json/";

export interface DINAPIRecord {
  file_number: string;              // N° de Solicitud (fileNbr)
  registration_number: string;      // N° de Registro (regNbr)
  title: string;                    // Denominación de la marca (titulo)
  nice_class: string;               // Clase Niza (clase)
  owner: string;                    // Titular / Solicitante (titular)
  status: string;                   // Estado legal (estado: Concedida, En trámite, etc.)
  application_date: string;         // Fecha de Solicitud (fecha)
  registration_date: string;        // Fecha de Concesión (regDate)
  expiration_date: string;          // Fecha de Vencimiento (vence)
  sign_type: string;                // Denominativa, Mixta, Figurativa (signo)
  procedure_type: string;           // REG, REN (typ)
  agent: string;                    // Agente de PI (agent)
  logo_url?: string;                // Logo si existe
  similarity_score: number;         // Score 0 a 100
  similarity_risk: string;          // Categoría de riesgo
  is_active: boolean;
  is_granted: boolean;
  is_pending: boolean;
  raw_data?: Record<string, any>;
}

export interface DINAPISearchResult {
  total_found: number;
  is_truncated: boolean;
  total_potential_in_database: number;
  records: DINAPIRecord[];
}

export class DINAPIClient {
  private endpointUrl: string;
  private timeoutMs: number;

  constructor(endpointUrl: string = DINAPI_BASE_URL, timeoutSeconds: number = 15) {
    this.endpointUrl = endpointUrl;
    this.timeoutMs = timeoutSeconds * 1000;
  }

  private buildPayload(params: {
    nameEquals?: string;
    nameContains?: string;
    nameSoundsLike?: string;
    niceClass?: number | string;
    ownerName?: string;
    regNumber?: number | string;
    fileNumber?: number | string;
    statusCode?: string;
  }): Record<string, any> {
    const classStr = params.niceClass !== undefined && params.niceClass !== null ? String(params.niceClass).trim() : "";
    const regStr = params.regNumber !== undefined && params.regNumber !== null ? String(params.regNumber).trim() : "";
    const fileStr = params.fileNumber !== undefined && params.fileNumber !== null ? String(params.fileNumber).trim() : "";

    return {
      arg0: {
        criteriaExtraData: {
          dataCodeId1: "", dataCodeId2: "", dataCodeId3: "", dataCodeId4: "", dataCodeId5: "",
          dataCodeTyp1: "", dataCodeTyp2: "", dataCodeTyp3: "", dataCodeTyp4: "", dataCodeTyp5: "",
          dataDate1From: { dateValue: "" }, dataDate1To: { dateValue: "" },
          dataDate2From: { dateValue: "" }, dataDate2To: { dateValue: "" },
          dataDate3From: { dateValue: "" }, dataDate3To: { dateValue: "" },
          dataDate4From: { dateValue: "" }, dataDate4To: { dateValue: "" },
          dataDate5From: { dateValue: "" }, dataDate5To: { dateValue: "" },
          dataFlag1: "", dataFlag2: "", dataFlag3: "", dataFlag4: "", dataFlag5: "",
          dataNbr1: { doubleValue: "" }, dataNbr2: { doubleValue: "" }, dataNbr3: { doubleValue: "" },
          dataNbr4: { doubleValue: "" }, dataNbr5: { doubleValue: "" },
          dataText1: "", dataText2: "", dataText3: "", dataText4: "", dataText5: ""
        },
        criteriaFileId: {
          fileIdList: { fileNbr: { doubleValue: "" }, fileSeq: "", fileSeries: { doubleValue: "" }, fileType: "" },
          fileNbrFrom: { doubleValue: fileStr },
          fileNbrTo: { doubleValue: fileStr },
          fileSeq: "", fileSeries: { doubleValue: "" }, fileType: "",
          madridInternationalRegNo: "", officeDocumentNbr: { doubleValue: "" }, publicationNbr: { doubleValue: "" }
        },
        criteriaFilingData: {
          applicationSubtype: "", applicationType: "", externalOffice: "", externalSystemId: "",
          filingDateFrom: { dateValue: "" }, filingDateTo: { dateValue: "" },
          indManualInterpretationRequired: "", isValidationPending: "",
          noveltyDateFrom: { dateValue: "" }, noveltyDateTo: { dateValue: "" },
          receptionDateFrom: { dateValue: "" }, receptionDateTo: { dateValue: "" }
        },
        criteriaMadridData: { docType: "", tranType: "" },
        criteriaOwnershipData: {
          individualIdNbr: "", individualIdType: "", legalIdNbr: "", legalIdType: "",
          nationalityCountryCode: "", ownerNameContainsWords: (params.ownerName || "").trim(),
          ownerNameInOtherLangContainsWords: "", personGroupNbr: "", residenceCountryCode: "", stateCode: ""
        },
        criteriaProtectionData: {
          criteriaNiceClassList: { niceClassEdition: { doubleValue: "" }, niceClassNbr: { doubleValue: classStr } },
          indIgnoreNotRegisteredNiceClasses: "", indIncludeReclassifiedNiceClasses: "", indIncludeRelatedNiceClasses: "",
          searchClassList: { searchClassNbr: { doubleValue: "" } }
        },
        criteriaReceipt: { receiptNbr: "" },
        criteriaRegistrationData: {
          entitlementDateFrom: { dateValue: "" }, entitlementDateTo: { dateValue: "" },
          expirationDateFrom: { dateValue: "" }, expirationDateTo: { dateValue: "" },
          registrationDateFrom: { dateValue: "" }, registrationDateTo: { dateValue: "" },
          registrationDup: "",
          registrationNbrFrom: { doubleValue: regStr },
          registrationNbrTo: { doubleValue: regStr },
          registrationSeries: { doubleValue: "" }, registrationType: ""
        },
        criteriaRepresentationData: {
          agentCode: { doubleValue: "" }, indNoRepresentative: "", individualIdNbr: "", individualIdType: "",
          legalIdNbr: "", legalIdType: "", representativeNameContainsWords: "",
          representativeNameInOtherLangContainsWords: "", representativeType: ""
        },
        criteriaSignData: {
          markNameContainsWords: (params.nameContains || "").trim(),
          markNameEquals: (params.nameEquals || "").trim(),
          markNameInOtherLangContainsWords: "",
          markNameSoundsLike: (params.nameSoundsLike || "").trim(),
          markTranslationContainsWords: "",
          markTranslationInOtherLangContainsWords: "",
          markTransliterationContainsWords: "",
          markTransliterationInOtherLangContainsWords: "",
          signType: ""
        },
        criteriaStatus: {
          expirationDateFrom: { dateValue: "" }, expirationDateIsDue: "", expirationDateTo: { dateValue: "" },
          indApplyStatusSimilarityIgnore: "", indStatusInactive: "", indStatusPending: "", indStatusRegistered: "",
          processResultType: "", processType: "", statusCode: params.statusCode || "", statusGroupCode: "", substatusCode: ""
        }
      }
    };
  }

  private async executeQuery(payload: Record<string, any>): Promise<any> {
    const postData = JSON.stringify(payload);

    // Using https.Agent with rejectUnauthorized: false to safely connect with Paraguayan governmental certificate chain
    return new Promise((resolve, reject) => {
      const url = new URL(this.endpointUrl);
      const agent = new https.Agent({ rejectUnauthorized: false });

      const req = https.request(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 MarcaCheck/1.0"
          },
          agent: agent,
          timeout: this.timeoutMs
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 400) {
              return reject(new Error(`DINAPI HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
            }
            try {
              const data = JSON.parse(body);
              resolve(data);
            } catch (err: any) {
              reject(new Error(`Error parsing DINAPI JSON response: ${err.message}`));
            }
          });
        }
      );

      req.on("error", (err) => {
        reject(err);
      });

      req.on("timeout", () => {
        req.destroy(new Error("DINAPI request timed out"));
      });

      req.write(postData);
      req.end();
    });
  }

  private parseRecords(rawResponse: any, referenceTerm: string = ""): DINAPIRecord[] {
    const records: DINAPIRecord[] = [];
    if (!Array.isArray(rawResponse)) return records;

    for (const item of rawResponse) {
      if (!item || typeof item !== "object") continue;
      // Skip summary object: {"total": X, "criterios": "..."}
      if ("total" in item && "criterios" in item && Object.keys(item).length <= 2) {
        continue;
      }

      const title = String(item.titulo || "").trim();
      if (!title) continue;

      const regRaw = item.regNbr || item.noRegistro || "";
      const regClean = typeof regRaw === "number" ? (regRaw > 0 ? String(Math.floor(regRaw)) : "") : String(regRaw).trim();

      const fileRaw = item.fileNbr || item.FILE_NBR || item.noSolicitud || "";
      const fileClean = typeof fileRaw === "number" ? (fileRaw > 0 ? String(Math.floor(fileRaw)) : "") : String(fileRaw).trim();

      let simScore = 0.0;
      let simRisk = "";
      if (referenceTerm) {
        const [score, risk] = trademarkSimilarityScore(referenceTerm, title);
        simScore = score;
        simRisk = risk;
      }

      const status = String(item.estado || "").trim();
      const statusLower = status.toLowerCase();

      const isActive =
        statusLower.includes("concedida") ||
        statusLower.includes("renovada") ||
        statusLower.includes("en tramite") ||
        statusLower.includes("en trámite") ||
        statusLower.includes("publicada");

      const isGranted = statusLower.includes("concedida") || statusLower.includes("renovada");
      const isPending =
        statusLower.includes("tramite") ||
        statusLower.includes("trámite") ||
        statusLower.includes("publicad") ||
        statusLower.includes("examen");

      records.push({
        file_number: fileClean,
        registration_number: regClean,
        title,
        nice_class: String(item.clase || "").trim(),
        owner: String(item.titular || "").trim(),
        status,
        application_date: String(item.fecha || "").trim(),
        registration_date: String(item.regDate || "").trim(),
        expiration_date: String(item.vence || "").trim(),
        sign_type: String(item.signo || "").trim(),
        procedure_type: String(item.typ || "").trim(),
        agent: String(item.agent || "").trim(),
        logo_url: item.logo ? String(item.logo).trim() : undefined,
        similarity_score: simScore,
        similarity_risk: simRisk,
        is_active: isActive,
        is_granted: isGranted,
        is_pending: isPending,
        raw_data: item
      });
    }

    if (referenceTerm) {
      records.sort((a, b) => b.similarity_score - a.similarity_score);
    }

    return records;
  }

  async searchContains(name: string, niceClass?: number | string): Promise<DINAPIRecord[]> {
    const payload = this.buildPayload({ nameContains: name, niceClass });
    const raw = await this.executeQuery(payload);
    return this.parseRecords(raw, name);
  }

  async searchExact(name: string, niceClass?: number | string): Promise<DINAPIRecord[]> {
    const payload = this.buildPayload({ nameEquals: name, niceClass });
    const raw = await this.executeQuery(payload);
    return this.parseRecords(raw, name);
  }

  async searchSoundsLike(name: string, niceClass?: number | string): Promise<DINAPIRecord[]> {
    const payload = this.buildPayload({ nameSoundsLike: name, niceClass });
    const raw = await this.executeQuery(payload);
    return this.parseRecords(raw, name);
  }

  async searchComprehensive(
    name: string,
    niceClass?: number | string,
    maxResults: number = 60
  ): Promise<DINAPISearchResult> {
    const seenKeys = new Set<string>();
    const consolidated: DINAPIRecord[] = [];
    let isTruncated = false;
    let totalPotential = 0;

    // 1. Consulta por contención
    try {
      const payloadContains = this.buildPayload({ nameContains: name, niceClass });
      const rawContains = await this.executeQuery(payloadContains);
      if (typeof rawContains === "number") {
        totalPotential = rawContains;
        isTruncated = true;
      } else if (Array.isArray(rawContains)) {
        const parsed = this.parseRecords(rawContains, name);
        for (const r of parsed) {
          const key = `${r.title.toUpperCase()}_${r.nice_class}_${r.file_number || r.registration_number}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            consolidated.push(r);
          }
        }
      }
    } catch (err) {
      console.warn("Error en DINAPI búsqueda por contención:", err);
    }

    // 2. Si no hubo resultados o para asegurar coincidencia exacta
    try {
      const payloadExact = this.buildPayload({ nameEquals: name, niceClass });
      const rawExact = await this.executeQuery(payloadExact);
      if (Array.isArray(rawExact)) {
        const parsed = this.parseRecords(rawExact, name);
        for (const r of parsed) {
          const key = `${r.title.toUpperCase()}_${r.nice_class}_${r.file_number || r.registration_number}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            consolidated.push(r);
          }
        }
      }
    } catch (err) {
      console.warn("Error en DINAPI búsqueda exacta:", err);
    }

    // Ordenar por similitud
    consolidated.sort((a, b) => b.similarity_score - a.similarity_score);

    return {
      total_found: consolidated.length,
      is_truncated: isTruncated,
      total_potential_in_database: totalPotential,
      records: consolidated.slice(0, maxResults)
    };
  }
}
