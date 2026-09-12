"""
Cliente oficial y adaptado para la API de marcas de la DINAPI (Paraguay).
Interactúa con el backend del sistema Joaju / IPAS de DINAPI.
"""

import json
import logging
import urllib.request
import urllib.error
from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any, Union

try:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
except Exception:
    pass

from .phonetics import normalize_mark_name, trademark_similarity_score

logger = logging.getLogger("dinapi_client")

DINAPI_BASE_URL = "https://joaju.dinapi.gov.py/api/api/markMarkGetList-json/"

@dataclass
class DINAPIRecord:
    file_number: str              # N° de Solicitud (fileNbr)
    registration_number: str      # N° de Registro (regNbr)
    title: str                    # Denominación de la marca (titulo)
    nice_class: str               # Clase Niza (clase)
    owner: str                    # Titular / Solicitante (titular)
    status: str                   # Estado legal (estado: Concedida, En trámite, etc.)
    application_date: str         # Fecha de Solicitud (fecha)
    registration_date: str        # Fecha de Concesión (regDate)
    expiration_date: str          # Fecha de Vencimiento (vence)
    sign_type: str                # Denominativa, Mixta, Figurativa (signo)
    procedure_type: str           # REG, REN (typ)
    agent: str                    # Agente de PI (agent)
    logo_url: str = ""            # Logo si existe
    similarity_score: float = 0.0 # Score calculado de similitud con el término buscado
    similarity_risk: str = ""     # Categoría de riesgo de confusión
    raw_data: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_active(self) -> bool:
        """Determina si la marca está activa o con derechos vigentes."""
        st = (self.status or "").lower()
        if "concedida" in st or "renovada" in st or "en tramite" in st or "en trámite" in st or "publicada" in st:
            return True
        return False

    @property
    def is_granted(self) -> bool:
        """Indica si la marca ya fue efectivamente concedida/registrada."""
        st = (self.status or "").lower()
        return "concedida" in st or "renovada" in st

    @property
    def is_pending(self) -> bool:
        """Indica si la marca es una solicitud en trámite."""
        st = (self.status or "").lower()
        return "tramite" in st or "trámite" in st or "publicad" in st or "examen" in st

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["is_active"] = self.is_active
        data["is_granted"] = self.is_granted
        data["is_pending"] = self.is_pending
        return data


class DINAPIClient:
    """Cliente para realizar consultas sobre registros de marcas en la DINAPI."""

    def __init__(self, endpoint_url: str = DINAPI_BASE_URL, timeout: int = 15):
        self.endpoint_url = endpoint_url
        self.timeout = timeout

    def _build_payload(
        self,
        name_equals: str = "",
        name_contains: str = "",
        name_sounds_like: str = "",
        nice_class: Optional[Union[int, str]] = None,
        owner_name: str = "",
        reg_number: Optional[Union[int, str]] = None,
        file_number: Optional[Union[int, str]] = None,
        status_code: str = "",
    ) -> Dict[str, Any]:
        """Construye el payload JSON exacto esperado por el servicio IPAS de DINAPI."""
        class_str = str(nice_class).strip() if nice_class is not None and str(nice_class).strip() != "" else ""
        reg_str = str(reg_number).strip() if reg_number is not None and str(reg_number).strip() != "" else ""
        file_str = str(file_number).strip() if file_number is not None and str(file_number).strip() != "" else ""

        return {
            "arg0": {
                "criteriaExtraData": {
                    "dataCodeId1": "", "dataCodeId2": "", "dataCodeId3": "", "dataCodeId4": "", "dataCodeId5": "",
                    "dataCodeTyp1": "", "dataCodeTyp2": "", "dataCodeTyp3": "", "dataCodeTyp4": "", "dataCodeTyp5": "",
                    "dataDate1From": {"dateValue": ""}, "dataDate1To": {"dateValue": ""},
                    "dataDate2From": {"dateValue": ""}, "dataDate2To": {"dateValue": ""},
                    "dataDate3From": {"dateValue": ""}, "dataDate3To": {"dateValue": ""},
                    "dataDate4From": {"dateValue": ""}, "dataDate4To": {"dateValue": ""},
                    "dataDate5From": {"dateValue": ""}, "dataDate5To": {"dateValue": ""},
                    "dataFlag1": "", "dataFlag2": "", "dataFlag3": "", "dataFlag4": "", "dataFlag5": "",
                    "dataNbr1": {"doubleValue": ""}, "dataNbr2": {"doubleValue": ""}, "dataNbr3": {"doubleValue": ""},
                    "dataNbr4": {"doubleValue": ""}, "dataNbr5": {"doubleValue": ""},
                    "dataText1": "", "dataText2": "", "dataText3": "", "dataText4": "", "dataText5": ""
                },
                "criteriaFileId": {
                    "fileIdList": {"fileNbr": {"doubleValue": ""}, "fileSeq": "", "fileSeries": {"doubleValue": ""}, "fileType": ""},
                    "fileNbrFrom": {"doubleValue": file_str},
                    "fileNbrTo": {"doubleValue": file_str},
                    "fileSeq": "", "fileSeries": {"doubleValue": ""}, "fileType": "",
                    "madridInternationalRegNo": "", "officeDocumentNbr": {"doubleValue": ""}, "publicationNbr": {"doubleValue": ""}
                },
                "criteriaFilingData": {
                    "applicationSubtype": "", "applicationType": "", "externalOffice": "", "externalSystemId": "",
                    "filingDateFrom": {"dateValue": ""}, "filingDateTo": {"dateValue": ""},
                    "indManualInterpretationRequired": "", "isValidationPending": "",
                    "noveltyDateFrom": {"dateValue": ""}, "noveltyDateTo": {"dateValue": ""},
                    "receptionDateFrom": {"dateValue": ""}, "receptionDateTo": {"dateValue": ""}
                },
                "criteriaMadridData": {"docType": "", "tranType": ""},
                "criteriaOwnershipData": {
                    "individualIdNbr": "", "individualIdType": "", "legalIdNbr": "", "legalIdType": "",
                    "nationalityCountryCode": "", "ownerNameContainsWords": owner_name.strip(),
                    "ownerNameInOtherLangContainsWords": "", "personGroupNbr": "", "residenceCountryCode": "", "stateCode": ""
                },
                "criteriaProtectionData": {
                    "criteriaNiceClassList": {"niceClassEdition": {"doubleValue": ""}, "niceClassNbr": {"doubleValue": class_str}},
                    "indIgnoreNotRegisteredNiceClasses": "", "indIncludeReclassifiedNiceClasses": "", "indIncludeRelatedNiceClasses": "",
                    "searchClassList": {"searchClassNbr": {"doubleValue": ""}}
                },
                "criteriaReceipt": {"receiptNbr": ""},
                "criteriaRegistrationData": {
                    "entitlementDateFrom": {"dateValue": ""}, "entitlementDateTo": {"dateValue": ""},
                    "expirationDateFrom": {"dateValue": ""}, "expirationDateTo": {"dateValue": ""},
                    "registrationDateFrom": {"dateValue": ""}, "registrationDateTo": {"dateValue": ""},
                    "registrationDup": "",
                    "registrationNbrFrom": {"doubleValue": reg_str},
                    "registrationNbrTo": {"doubleValue": reg_str},
                    "registrationSeries": {"doubleValue": ""}, "registrationType": ""
                },
                "criteriaRepresentationData": {
                    "agentCode": {"doubleValue": ""}, "indNoRepresentative": "", "individualIdNbr": "", "individualIdType": "",
                    "legalIdNbr": "", "legalIdType": "", "representativeNameContainsWords": "",
                    "representativeNameInOtherLangContainsWords": "", "representativeType": ""
                },
                "criteriaSignData": {
                    "markNameContainsWords": name_contains.strip(),
                    "markNameEquals": name_equals.strip(),
                    "markNameInOtherLangContainsWords": "",
                    "markNameSoundsLike": name_sounds_like.strip(),
                    "markTranslationContainsWords": "",
                    "markTranslationInOtherLangContainsWords": "",
                    "markTransliterationContainsWords": "",
                    "markTransliterationInOtherLangContainsWords": "",
                    "signType": ""
                },
                "criteriaStatus": {
                    "expirationDateFrom": {"dateValue": ""}, "expirationDateIsDue": "", "expirationDateTo": {"dateValue": ""},
                    "indApplyStatusSimilarityIgnore": "", "indStatusInactive": "", "indStatusPending": "", "indStatusRegistered": "",
                    "processResultType": "", "processType": "", "statusCode": status_code, "statusGroupCode": "", "substatusCode": ""
                }
            }
        }

    def _execute_query(self, payload: Dict[str, Any]) -> Union[List[Dict[str, Any]], int, str]:
        """Envía la solicitud HTTP POST a la API de DINAPI y procesa la respuesta."""
        # 1. Intentar con requests
        try:
            import requests
            resp = requests.post(
                self.endpoint_url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 MarcaCheck/1.0"
                },
                timeout=self.timeout,
                verify=False  # DINAPI gubernamental usa cadena intermedia local
            )
            if resp.status_code != 200:
                raise RuntimeError(f"Error HTTP {resp.status_code} de DINAPI: {resp.text}")
            return resp.json()
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"Error usando requests con DINAPI, probando urllib: {e}")

        # 2. Fallback con urllib
        import ssl
        ctx = ssl.create_default_context()
        try:
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        except Exception:
            pass

        try:
            req = urllib.request.Request(
                self.endpoint_url,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 MarcaCheck/1.0"
                },
                data=json.dumps(payload).encode("utf-8"),
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=self.timeout, context=ctx) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data
        except urllib.error.HTTPError as e:
            logger.error(f"HTTP Error al consultar DINAPI: {e.code} - {e.reason}")
            raise RuntimeError(f"Error HTTP {e.code} de DINAPI: {e.reason}")
        except urllib.error.URLError as e:
            logger.error(f"Error de red al conectar con DINAPI: {e.reason}")
            raise RuntimeError(f"No se pudo conectar con DINAPI: {e.reason}")
        except Exception as e:
            logger.error(f"Error inesperado al consultar DINAPI: {e}")
            raise RuntimeError(f"Error en consulta DINAPI: {str(e)}")

    def _parse_records(self, raw_response: Any, reference_term: str = "") -> List[DINAPIRecord]:
        """Convierte los datos brutos recibidos de DINAPI en objetos normalizados DINAPIRecord."""
        records: List[DINAPIRecord] = []

        if not isinstance(raw_response, list):
            return records

        for item in raw_response:
            if not isinstance(item, dict):
                continue
            # El primer elemento devuelto por DINAPI suele ser {"total": X, "criterios": "..."}
            if "total" in item and "criterios" in item and len(item) <= 2:
                continue

            title = str(item.get("titulo") or "").strip()
            if not title:
                continue

            # Extraer número de registro
            reg_raw = item.get("regNbr") or item.get("noRegistro") or ""
            if isinstance(reg_raw, (int, float)):
                reg_clean = str(int(reg_raw)) if reg_raw > 0 else ""
            else:
                reg_clean = str(reg_raw).strip()

            # Extraer número de solicitud
            file_raw = item.get("fileNbr") or item.get("FILE_NBR") or item.get("noSolicitud") or ""
            if isinstance(file_raw, (int, float)):
                file_clean = str(int(file_raw)) if file_raw > 0 else ""
            else:
                file_clean = str(file_raw).strip()

            # Calcular similitud fonética/gráfica si se proveyó término de referencia
            sim_score = 0.0
            sim_risk = ""
            if reference_term:
                sim_score, sim_risk = trademark_similarity_score(reference_term, title)

            record = DINAPIRecord(
                file_number=file_clean,
                registration_number=reg_clean,
                title=title,
                nice_class=str(item.get("clase") or "").strip(),
                owner=str(item.get("titular") or "").strip(),
                status=str(item.get("estado") or "").strip(),
                application_date=str(item.get("fecha") or "").strip(),
                registration_date=str(item.get("regDate") or "").strip(),
                expiration_date=str(item.get("vence") or "").strip(),
                sign_type=str(item.get("signo") or "").strip(),
                procedure_type=str(item.get("typ") or "").strip(),
                agent=str(item.get("agent") or "").strip(),
                logo_url=str(item.get("logo") or "").strip(),
                similarity_score=sim_score,
                similarity_risk=sim_risk,
                raw_data=item
            )
            records.append(record)

        # Ordenar por similitud si está disponible
        if reference_term:
            records.sort(key=lambda r: r.similarity_score, reverse=True)

        return records

    def search_exact(self, name: str, nice_class: Optional[Union[int, str]] = None) -> List[DINAPIRecord]:
        """Búsqueda de marcas con denominación exacta."""
        payload = self._build_payload(name_equals=name, nice_class=nice_class)
        raw = self._execute_query(payload)
        return self._parse_records(raw, reference_term=name)

    def search_contains(self, name: str, nice_class: Optional[Union[int, str]] = None) -> List[DINAPIRecord]:
        """Búsqueda de marcas que contengan los términos indicados."""
        payload = self._build_payload(name_contains=name, nice_class=nice_class)
        raw = self._execute_query(payload)
        return self._parse_records(raw, reference_term=name)

    def search_sounds_like(self, name: str, nice_class: Optional[Union[int, str]] = None) -> List[DINAPIRecord]:
        """Búsqueda de marcas por aproximación fonética en el motor IPAS."""
        payload = self._build_payload(name_sounds_like=name, nice_class=nice_class)
        raw = self._execute_query(payload)
        return self._parse_records(raw, reference_term=name)

    def search_by_owner(self, owner_name: str, nice_class: Optional[Union[int, str]] = None) -> List[DINAPIRecord]:
        """Búsqueda de marcas por titular o solicitante."""
        payload = self._build_payload(owner_name=owner_name, nice_class=nice_class)
        raw = self._execute_query(payload)
        return self._parse_records(raw)

    def search_by_registration(self, reg_number: Union[int, str]) -> List[DINAPIRecord]:
        """Búsqueda directa por número de registro concedido."""
        payload = self._build_payload(reg_number=reg_number)
        raw = self._execute_query(payload)
        return self._parse_records(raw)

    def search_by_file(self, file_number: Union[int, str]) -> List[DINAPIRecord]:
        """Búsqueda directa por número de expediente/solicitud."""
        payload = self._build_payload(file_number=file_number)
        raw = self._execute_query(payload)
        return self._parse_records(raw)

    def search_comprehensive(
        self,
        name: str,
        nice_class: Optional[Union[int, str]] = None,
        max_results: int = 50
    ) -> Dict[str, Any]:
        """
        Búsqueda exhaustiva multidimensional:
        1. Consulta marcas que contengan las palabras (`markNameContainsWords`).
        2. Consulta marcas exactas (`markNameEquals`).
        3. Evalúa similitud fonética y gráfica contra el catálogo recuperado.
        4. Consolida y desduplica registros (por fileNbr o regNbr).
        """
        normalized_target = normalize_mark_name(name)
        seen_keys = set()
        consolidated: List[DINAPIRecord] = []
        is_truncated = False
        total_potential = 0

        # Paso 1: Búsqueda por contención
        try:
            p_contains = self._build_payload(name_contains=name, nice_class=nice_class)
            raw_contains = self._execute_query(p_contains)
            if isinstance(raw_contains, (int, float)):
                total_potential = int(raw_contains)
                is_truncated = True
            elif isinstance(raw_contains, list):
                records = self._parse_records(raw_contains, reference_term=name)
                for r in records:
                    key = (r.title.upper(), r.nice_class, r.file_number or r.registration_number)
                    if key not in seen_keys:
                        seen_keys.add(key)
                        consolidated.append(r)
        except Exception as e:
            logger.warning(f"Error en consulta por contención: {e}")

        # Paso 2: Si el nombre tiene varias palabras o si queremos asegurar exacta
        try:
            p_exact = self._build_payload(name_equals=name, nice_class=nice_class)
            raw_exact = self._execute_query(p_exact)
            if isinstance(raw_exact, list):
                records = self._parse_records(raw_exact, reference_term=name)
                for r in records:
                    key = (r.title.upper(), r.nice_class, r.file_number or r.registration_number)
                    if key not in seen_keys:
                        seen_keys.add(key)
                        consolidated.append(r)
        except Exception as e:
            logger.warning(f"Error en consulta exacta: {e}")

        # Si el nombre es compuesto (ej. "SAN JUAN ALIMENTOS"), también buscamos por la palabra raíz distintiva
        words = [w for w in normalized_target.split() if len(w) >= 3 and w not in ["DEL", "LOS", "LAS", "POR", "PARA", "CON", "SIN", "PARAGUAY", "PY"]]
        if len(words) > 1 and len(consolidated) < 15:
            for root_word in words[:2]:
                try:
                    p_word = self._build_payload(name_contains=root_word, nice_class=nice_class)
                    raw_word = self._execute_query(p_word)
                    if isinstance(raw_word, list):
                        records = self._parse_records(raw_word, reference_term=name)
                        for r in records:
                            # Solo agregamos si supera un umbral de similitud relevante (>= 40%)
                            if r.similarity_score >= 40.0:
                                key = (r.title.upper(), r.nice_class, r.file_number or r.registration_number)
                                if key not in seen_keys:
                                    seen_keys.add(key)
                                    consolidated.append(r)
                except Exception as e:
                    logger.debug(f"Consulta de palabra raíz '{root_word}' omitida o con error: {e}")

        # Ordenar registros consolidados por similitud descendente
        consolidated.sort(key=lambda r: (r.similarity_score, r.is_active), reverse=True)

        return {
            "query_name": name,
            "nice_class": nice_class,
            "total_found": len(consolidated),
            "total_potential_in_database": total_potential,
            "is_truncated": is_truncated,
            "records": consolidated[:max_results]
        }
