"""
Cliente de Inteligencia Web mediante Tavily Search API.
Especializado en investigación de presencia marcaria, competencia comercial,
marcas de hecho no registradas, dominios y notoriedad.
"""

import os
import json
import logging
import urllib.request
import urllib.error
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional

from data.niza import search_niza_classes, NizaClass

logger = logging.getLogger("tavily_client")

TAVILY_SEARCH_URL = "https://api.tavily.com/search"

@dataclass
class WebSearchResult:
    title: str
    url: str
    content: str
    score: float = 0.0
    is_local_py: bool = False
    domain: str = ""

@dataclass
class BrandWebReport:
    brand_name: str
    query_used: str
    has_live_api: bool
    total_results: int
    results: List[WebSearchResult] = field(default_factory=list)
    py_presence_detected: bool = False
    social_profiles: List[Dict[str, str]] = field(default_factory=list)
    detected_activities: List[str] = field(default_factory=list)
    suggested_niza_classes: List[Dict[str, Any]] = field(default_factory=list)
    summary: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TavilyBrandResearcher:
    """Investigador de presencia web comercial y notoriedad marcaria con Tavily."""

    def __init__(self, api_key: Optional[str] = None, timeout: int = 15):
        # Si se pasa explícitamente una clave (incluso vacía para pruebas), respetarla
        if api_key is not None:
            k = api_key.strip()
        else:
            k = os.environ.get("TAVILY_API_KEY", "").strip()
            if not k:
                env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
                if os.path.exists(env_file):
                    try:
                        with open(env_file, "r", encoding="utf-8") as f:
                            for line in f:
                                line = line.strip()
                                if line.startswith("TAVILY_API_KEY="):
                                    k = line.split("=", 1)[1].strip().strip("'\"")
                                    break
                    except Exception:
                        pass
        self.api_key = k
        self.timeout = timeout

    def has_valid_key(self) -> bool:
        """Verifica si se dispone de una clave API configurada."""
        return bool(self.api_key and len(self.api_key) > 5)

    def _call_tavily_api(self, query: str, max_results: int = 5, search_depth: str = "basic") -> Dict[str, Any]:
        """Ejecuta una llamada HTTP POST directa al API de Tavily."""
        if not self.has_valid_key():
            raise ValueError("No se ha configurado la clave TAVILY_API_KEY")

        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": search_depth,
            "include_answer": True,
            "include_domains": [],
            "exclude_domains": [],
            "max_results": max_results
        }

        # Intentar primero con requests (maneja certificados SSL en macOS)
        try:
            import requests
            resp = requests.post(
                TAVILY_SEARCH_URL,
                json=payload,
                headers={"User-Agent": "MarcaCheck-TavilyClient/1.0"},
                timeout=self.timeout
            )
            if resp.status_code != 200:
                raise RuntimeError(f"Tavily API returned status {resp.status_code}: {resp.text}")
            return resp.json()
        except ImportError:
            pass

        # Fallback a urllib con contexto SSL tolerante
        import ssl
        ctx = ssl.create_default_context()
        try:
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        except Exception:
            pass

        req = urllib.request.Request(
            TAVILY_SEARCH_URL,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "MarcaCheck-TavilyClient/1.0"
            },
            data=json.dumps(payload).encode("utf-8"),
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=self.timeout, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data

    def _extract_domain(self, url: str) -> str:
        """Extrae el dominio de una URL."""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return parsed.netloc.lower()
        except Exception:
            return ""

    def _analyze_commercial_presence(self, results: List[WebSearchResult]) -> Dict[str, Any]:
        """Analiza los resultados recopilados para identificar perfiles sociales y actividad."""
        py_detected = False
        social_profiles: List[Dict[str, str]] = []
        activities_text = []

        social_domains = {
            "instagram.com": "Instagram",
            "facebook.com": "Facebook",
            "linkedin.com": "LinkedIn",
            "twitter.com": "Twitter/X",
            "x.com": "Twitter/X",
            "tiktok.com": "TikTok",
            "youtube.com": "YouTube"
        }

        for r in results:
            domain = r.domain
            if ".py" in domain or "paraguay" in r.content.lower() or "asunción" in r.content.lower():
                py_detected = True
                r.is_local_py = True

            for s_dom, platform in social_domains.items():
                if s_dom in domain:
                    social_profiles.append({
                        "platform": platform,
                        "url": r.url,
                        "title": r.title
                    })

            activities_text.append(f"{r.title}. {r.content}")

        # Identificar sugerencias de clases Niza
        all_text = " ".join(activities_text)
        niza_suggestions = search_niza_classes(all_text)[:4]
        niza_data = []
        for cls in niza_suggestions:
            niza_data.append({
                "class_number": cls.number,
                "category": cls.category,
                "title": cls.title,
                "description": cls.description
            })

        return {
            "py_detected": py_detected,
            "social_profiles": social_profiles,
            "suggested_niza": niza_data
        }

    def research_brand(
        self,
        brand_name: str,
        category_hint: str = "",
        max_results: int = 7
    ) -> BrandWebReport:
        """
        Realiza la investigación de la marca en la web:
        1. Presencia comercial en Paraguay (empresas, tiendas, dominios .py).
        2. Detección de uso público previo.
        3. Detección de posibles marcas notorias internacionales.
        """
        # Formular query contextualizada en Paraguay
        if category_hint:
            query = f'"{brand_name}" {category_hint} Paraguay'
        else:
            query = f'"{brand_name}" Paraguay marca empresa producto'

        # Caso: Sin API Key -> Proporcionar informe analítico simulado/guía
        if not self.has_valid_key():
            logger.info("Tavily API key no detectada. Operando en modo demostración/diagnóstico.")
            return self._generate_fallback_report(brand_name, query, category_hint)

        try:
            api_data = self._call_tavily_api(query, max_results=max_results, search_depth="basic")
            raw_results = api_data.get("results", [])
            answer = api_data.get("answer", "")

            parsed_results: List[WebSearchResult] = []
            for item in raw_results:
                url = item.get("url", "")
                domain = self._extract_domain(url)
                parsed_results.append(WebSearchResult(
                    title=item.get("title", ""),
                    url=url,
                    content=item.get("content", ""),
                    score=float(item.get("score", 0.0)),
                    domain=domain
                ))

            analysis = self._analyze_commercial_presence(parsed_results)

            summary = answer if answer else (
                f"Se encontraron {len(parsed_results)} referencias web relacionadas con '{brand_name}'. "
                f"{'Se detectó presencia activa vinculada a Paraguay.' if analysis['py_detected'] else 'No se identificó presencia comercial preponderante directa en dominios .py.'}"
            )

            return BrandWebReport(
                brand_name=brand_name,
                query_used=query,
                has_live_api=True,
                total_results=len(parsed_results),
                results=parsed_results,
                py_presence_detected=analysis["py_detected"],
                social_profiles=analysis["social_profiles"],
                suggested_niza_classes=analysis["suggested_niza"],
                summary=summary
            )

        except Exception as e:
            logger.error(f"Error en consulta a Tavily API: {e}")
            # En caso de error de red o cuota, generar reporte seguro con advertencia
            fallback = self._generate_fallback_report(brand_name, query, category_hint)
            fallback.summary = f"Aviso de búsqueda web: {str(e)}. Consulta de mercado realizada en modo alternativo."
            return fallback

    def _generate_fallback_report(self, brand_name: str, query: str, category_hint: str) -> BrandWebReport:
        """Genera un reporte estructural de mercado cuando no hay clave API configurada."""
        niza_candidates = search_niza_classes(f"{brand_name} {category_hint}")[:3]
        niza_data = [
            {
                "class_number": c.number,
                "category": c.category,
                "title": c.title,
                "description": c.description
            }
            for c in niza_candidates
        ]

        summary = (
            f"Búsqueda web para '{brand_name}' preparada. "
            f"Para habilitar el rastreo autónomo en vivo de dominios .py, redes sociales y competidores "
            f"en tiempo real mediante Tavily, configura la variable TAVILY_API_KEY en tu archivo .env o en la interfaz."
        )

        return BrandWebReport(
            brand_name=brand_name,
            query_used=query,
            has_live_api=False,
            total_results=0,
            results=[],
            py_presence_detected=False,
            social_profiles=[],
            suggested_niza_classes=niza_data,
            summary=summary
        )
