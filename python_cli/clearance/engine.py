"""
Motor de Dictamen de Viabilidad de Marca (Trademark Clearance & Risk Engine).
Combina y pondera los antecedentes oficiales de DINAPI (Paraguay) y la inteligencia de mercado web de Tavily.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional, Tuple

from dinapi.client import DINAPIClient, DINAPIRecord
from web_intelligence.tavily_client import TavilyBrandResearcher, BrandWebReport
from data.niza import get_niza_class, NizaClass

@dataclass
class ClearanceVerdict:
    risk_level: str               # "BAJO", "MEDIO", "ALTO", "CRÍTICO"
    risk_color: str               # "green", "yellow", "orange", "red"
    risk_score: int               # 0 (sin riesgo) a 100 (riesgo absoluto de rechazo)
    viability_score: int          # 100 - risk_score
    headline: str                 # Resumen ejecutivo en una frase
    legal_basis: List[str]        # Fundamentos legales (Ley 1294/98 de Marcas)
    blocking_records: List[Dict[str, Any]] # Marcas en DINAPI que suponen un obstáculo directo
    related_records: List[Dict[str, Any]]  # Marcas similares o en clases afines
    web_findings: Dict[str, Any]  # Resumen de hallazgos en la web vía Tavily
    recommendations: List[str]    # Recomendaciones estratégicas de registro

@dataclass
class InvestigationReport:
    brand_name: str
    target_class: Optional[int]
    class_info: Optional[Dict[str, Any]]
    dinapi_summary: Dict[str, Any]
    web_summary: Dict[str, Any]
    verdict: ClearanceVerdict
    timestamp: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class BrandClearanceEngine:
    """Motor de orquestación para investigación integral de marcas."""

    def __init__(
        self,
        dinapi_client: Optional[DINAPIClient] = None,
        tavily_researcher: Optional[TavilyBrandResearcher] = None
    ):
        self.dinapi = dinapi_client or DINAPIClient()
        self.tavily = tavily_researcher or TavilyBrandResearcher()

    def investigate(
        self,
        brand_name: str,
        nice_class: Optional[int] = None,
        category_hint: str = "",
        max_dinapi_results: int = 50
    ) -> InvestigationReport:
        """
        Ejecuta la investigación completa de marca:
        1. Búsqueda y cotejo en la base oficial de DINAPI.
        2. Rastreo de presencia comercial y antecedentes en la web con Tavily.
        3. Dictamen y análisis de viabilidad legal y comercial.
        """
        import datetime
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 1. Obtener información de la Clase Niza si fue provista
        class_info = None
        target_class_obj: Optional[NizaClass] = None
        if nice_class:
            target_class_obj = get_niza_class(nice_class)
            if target_class_obj:
                class_info = {
                    "number": target_class_obj.number,
                    "category": target_class_obj.category,
                    "title": target_class_obj.title,
                    "description": target_class_obj.description,
                    "related_classes": target_class_obj.related_classes
                }

        # 2. Consultar DINAPI
        dinapi_res = self.dinapi.search_comprehensive(
            name=brand_name,
            nice_class=nice_class,
            max_results=max_dinapi_results
        )
        records: List[DINAPIRecord] = dinapi_res.get("records", [])

        # Si se especificó clase, también revisar clases afines para evaluar riesgo de asociación
        related_class_records: List[DINAPIRecord] = []
        if target_class_obj and target_class_obj.related_classes:
            for rel_cls in target_class_obj.related_classes[:2]:
                try:
                    rel_res = self.dinapi.search_contains(brand_name, nice_class=rel_cls)
                    for r in rel_res:
                        if r.similarity_score >= 60.0:
                            related_class_records.append(r)
                except Exception:
                    pass

        # 3. Consultar Tavily Web Search
        cat_for_web = category_hint or (target_class_obj.title if target_class_obj else "")
        web_report = self.tavily.research_brand(
            brand_name=brand_name,
            category_hint=cat_for_web
        )

        # 4. Evaluación de Riesgo y Dictamen
        verdict = self._evaluate_risk(
            brand_name=brand_name,
            target_class=nice_class,
            dinapi_records=records,
            related_records=related_class_records,
            web_report=web_report
        )

        return InvestigationReport(
            brand_name=brand_name,
            target_class=nice_class,
            class_info=class_info,
            dinapi_summary={
                "total_found": dinapi_res.get("total_found", len(records)),
                "is_truncated": dinapi_res.get("is_truncated", False),
                "total_potential": dinapi_res.get("total_potential_in_database", 0),
                "records": [r.to_dict() for r in records]
            },
            web_summary=web_report.to_dict(),
            verdict=verdict,
            timestamp=now_str
        )

    def _evaluate_risk(
        self,
        brand_name: str,
        target_class: Optional[int],
        dinapi_records: List[DINAPIRecord],
        related_records: List[DINAPIRecord],
        web_report: BrandWebReport
    ) -> ClearanceVerdict:
        """Calcula la puntuación de riesgo, semáforo y recomendaciones."""
        risk_score = 0
        blocking = []
        related = []
        legal_basis = []
        recommendations = []

        # Análisis DINAPI: Identidad directa y similitudes altas
        has_identical_active = False
        has_high_similarity = False
        has_pending_application = False

        for r in dinapi_records:
            # Identidad absoluta (100% de similitud)
            if r.similarity_score >= 95.0:
                if r.is_granted:
                    has_identical_active = True
                    blocking.append(r.to_dict())
                elif r.is_pending:
                    has_pending_application = True
                    blocking.append(r.to_dict())
                else:
                    # Inactiva o vencida
                    related.append(r.to_dict())
            elif r.similarity_score >= 70.0:
                if r.is_active:
                    has_high_similarity = True
                    blocking.append(r.to_dict())
                else:
                    related.append(r.to_dict())
            elif r.similarity_score >= 45.0:
                related.append(r.to_dict())

        # Revisar antecedentes en clases afines
        for r in related_records:
            if r.is_active and r.similarity_score >= 65.0:
                related.append(r.to_dict())

        # Ponderación de Score de Riesgo (0-100)
        if has_identical_active:
            risk_score = max(risk_score, 95)
            legal_basis.append("Art. 2 Inc. a) Ley 1294/98: No pueden registrarse signos idénticos a otros ya registrados para los mismos productos o servicios.")
            headline = f"Riesgo CRÍTICO: La marca '{brand_name}' ya se encuentra registrada y concedida en DINAPI a nombre de un tercero."
            recommendations.append("No se aconseja presentar la solicitud en la forma actual debido a un obstáculo insalvable de identidad.")
            recommendations.append("Evaluar una denominación sustancialmente distintiva o verificar si el registro vigente es susceptible de caducidad por falta de uso (Art. 27 Ley 1294/98).")

        elif has_pending_application:
            risk_score = max(risk_score, 85)
            legal_basis.append("Principio de Prioridad Registral: Existe una solicitud previa en trámite en DINAPI que confiere prelación a su solicitante.")
            headline = f"Riesgo ALTO: Existe una solicitud prioritaria en trámite en DINAPI para un signo idéntico."
            recommendations.append("Monitorear el trámite de la solicitud prioritaria para verificar si es concedida o denegada.")
            recommendations.append("Considerar la adopción de un elemento gráfico o denominativo complementario que diferencie claramente el signo.")

        elif has_high_similarity:
            risk_score = max(risk_score, 70)
            legal_basis.append("Art. 2 Inc. b) Ley 1294/98: Prohíbe signos semejantes que puedan inducir a confusión o asociación en el público consumidor.")
            headline = f"Riesgo ALTO: Se detectaron antecedentes en DINAPI con alta similitud fonética o gráfica."
            recommendations.append("Presentar la marca combinada con un diseño o logotipo fuertemente distintivo (marca mixta).")
            recommendations.append("Delimitar con precisión los productos o servicios específicos para minimizar el riesgo de oposición.")

        else:
            # Riesgo DINAPI moderado o bajo
            if related:
                risk_score = max(risk_score, 35)
                headline = f"Riesgo MEDIO-BAJO: No se hallaron marcas idénticas concedidas, aunque existen signos con similitud parcial."
                recommendations.append("La denominación cuenta con viabilidad registral preliminar en DINAPI.")
                recommendations.append("Se recomienda acompañar el registro con una adecuada reivindicación de elementos mixtos o gráficos.")
            else:
                risk_score = 10
                headline = f"Riesgo BAJO: La denominación '{brand_name}' no registra impedimentos directos en DINAPI."
                recommendations.append("Excelente disponibilidad marcaria en los registros oficiales de la DINAPI.")
                recommendations.append("Proceder con la presentación de la solicitud formal para asegurar la prioridad temporal de registro.")

        # Impacto de la Inteligencia Web Tavily
        if web_report.py_presence_detected:
            # Presencia activa en Paraguay
            if risk_score < 70:
                risk_score = min(80, risk_score + 25)
            headline += " Se detectó además presencia comercial activa en la web o comercio local."
            legal_basis.append("Doctrina de Marca de Hecho / Uso Previo: La existencia de un comercio preexistente en el mercado paraguayo puede facultar al usuario anterior a presentar oposición.")
            recommendations.append("Investigar la identidad del negocio detectado en internet para descartar conflicto de uso de hecho o titularidad.")

        if web_report.social_profiles:
            recommendations.append(f"Se identificaron perfiles en redes sociales vinculados ({', '.join([p.get('platform', '') for p in web_report.social_profiles[:3]])}).")

        # Nivel y color del semáforo
        if risk_score >= 85:
            level = "CRÍTICO"
            color = "red"
        elif risk_score >= 65:
            level = "ALTO"
            color = "orange"
        elif risk_score >= 35:
            level = "MEDIO"
            color = "yellow"
        else:
            level = "BAJO"
            color = "green"

        viability_score = max(0, 100 - risk_score)

        return ClearanceVerdict(
            risk_level=level,
            risk_color=color,
            risk_score=risk_score,
            viability_score=viability_score,
            headline=headline,
            legal_basis=legal_basis,
            blocking_records=blocking[:10],
            related_records=related[:15],
            web_findings={
                "has_live_api": web_report.has_live_api,
                "py_detected": web_report.py_presence_detected,
                "total_results": web_report.total_results,
                "summary": web_report.summary,
                "social_profiles": web_report.social_profiles,
                "suggested_niza": web_report.suggested_niza_classes
            },
            recommendations=recommendations
        )
