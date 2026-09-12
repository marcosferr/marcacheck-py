#!/usr/bin/env python3
"""
CLI de Investigación y Viabilidad de Marcas - MarcaCheck PY
Consulta registros oficiales de la DINAPI (Paraguay) y realiza inteligencia web con Tavily.
"""

import sys
import os
import argparse
import json

from dinapi.client import DINAPIClient
from web_intelligence.tavily_client import TavilyBrandResearcher
from clearance.engine import BrandClearanceEngine
from clearance.report import generate_markdown_report, generate_html_report
from data.niza import search_niza_classes, get_niza_class, NIZA_CLASSES

# Intentar cargar variables de entorno desde .env si existe
def load_dotenv_simple():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

load_dotenv_simple()

def cmd_investigate(args):
    """Ejecuta una investigación completa de marca combinando DINAPI y Tavily."""
    brand = args.brand.strip()
    nice_class = args.clase
    tavily_key = args.tavily_key or os.environ.get("TAVILY_API_KEY", "")

    print("\n" + "="*70)
    print(f"🔎 INICIANDO INVESTIGACIÓN DE MARCA: '{brand.upper()}'")
    if nice_class:
        cls_obj = get_niza_class(nice_class)
        title = f" ({cls_obj.title})" if cls_obj else ""
        print(f"📌 Clase Niza: {nice_class}{title}")
    else:
        print("📌 Clase Niza: Todas las clases")
    print("="*70)

    # Inicializar clientes
    dinapi = DINAPIClient()
    tavily = TavilyBrandResearcher(api_key=tavily_key)
    engine = BrandClearanceEngine(dinapi_client=dinapi, tavily_researcher=tavily)

    print("\n[1/3] ⚖️  Consultando base oficial de la DINAPI (Paraguay)...")
    report = engine.investigate(
        brand_name=brand,
        nice_class=nice_class,
        category_hint=args.categoria or "",
        max_dinapi_results=args.max_results
    )

    print(f"      -> {report.dinapi_summary.get('total_found', 0)} registros evaluados.")

    print("\n[2/3] 🌐 Ejecutando búsqueda web con Tavily...")
    if report.web_summary.get("has_live_api"):
        print(f"      -> Conexión en vivo con Tavily: {report.web_summary.get('total_results', 0)} hallazgos web.")
    else:
        print("      -> [Modo Demostración] Configura TAVILY_API_KEY para análisis web en vivo.")

    v = report.verdict
    color_code = {
        "green": "\033[92m",
        "yellow": "\033[93m",
        "orange": "\033[33m",
        "red": "\033[91m"
    }.get(v.risk_color, "\033[0m")
    reset_code = "\033[0m"

    print("\n[3/3] 📊 DICTAMEN DE VIABILIDAD:")
    print("-" * 70)
    print(f"NIVEL DE RIESGO:     {color_code}{v.risk_level}{reset_code}")
    print(f"ÍNDICE DE RIESGO:    {v.risk_score}%")
    print(f"ÍNDICE DE VIABILIDAD:{v.viability_score}%")
    print(f"RESUMEN:             {v.headline}")
    print("-" * 70)

    if v.blocking_records:
        print(f"\n⚠️  OBSTÁCULOS REGISTRALES EN DINAPI ({len(v.blocking_records)} detectados):")
        for idx, r in enumerate(v.blocking_records[:5], 1):
            reg = f"Reg: {r.get('registration_number')}" if r.get('registration_number') else f"Sol: {r.get('file_number')}"
            print(f"  {idx}. [{r.get('title')}] - Clase {r.get('nice_class')} | {reg} | Titular: {r.get('owner')} | Estado: {r.get('status')} | Similitud: {r.get('similarity_score')}%")

    if v.recommendations:
        print("\n💡 RECOMENDACIONES ESTRATÉGICAS:")
        for rec in v.recommendations:
            print(f"  • {rec}")

    # Guardar exportaciones si se solicitaron
    if args.output_html:
        html = generate_html_report(report)
        with open(args.output_html, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"\n📄 Reporte HTML exportado exitosamente en: {args.output_html}")

    if args.output_md:
        md = generate_markdown_report(report)
        with open(args.output_md, "w", encoding="utf-8") as f:
            f.write(md)
        print(f"\n📝 Reporte Markdown exportado exitosamente en: {args.output_md}")

    if args.output_json:
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(report.to_dict(), f, indent=2, ensure_ascii=False)
        print(f"\n📦 Reporte JSON exportado exitosamente en: {args.output_json}")

    print("\n" + "="*70 + "\n")


def cmd_niza(args):
    """Consulta la clasificación de Niza por número o palabra clave."""
    query = args.query.strip()
    if query.isdigit():
        cls_num = int(query)
        cls = get_niza_class(cls_num)
        if cls:
            print(f"\n🏷️  CLASE NIZA {cls.number} ({cls.category.upper()})")
            print(f"Título: {cls.title}")
            print(f"Descripción: {cls.description}")
            print(f"Palabras clave: {', '.join(cls.keywords)}")
            print(f"Clases afines: {cls.related_classes}\n")
        else:
            print(f"Clase {cls_num} no encontrada (rango válido: 1 a 45).")
    else:
        results = search_niza_classes(query)
        print(f"\n🔍 Clases Niza sugeridas para '{query}':")
        if not results:
            print("No se encontraron coincidencias directas.")
        for c in results[:5]:
            print(f"  • Clase {c.number} ({c.category}): {c.title} - {c.description[:80]}...")
        print()


def cmd_dinapi_direct(args):
    """Búsqueda directa en la base de la DINAPI."""
    client = DINAPIClient()
    term = args.term.strip()
    nice_class = args.clase
    print(f"\nConsultando DINAPI para '{term}' (Clase: {nice_class or 'Todas'})...")

    if args.tipo == "exacta":
        records = client.search_exact(term, nice_class=nice_class)
    elif args.tipo == "fonetica":
        records = client.search_sounds_like(term, nice_class=nice_class)
    else:
        records = client.search_contains(term, nice_class=nice_class)

    print(f"Encontrados: {len(records)} registros.")
    for idx, r in enumerate(records[:15], 1):
        reg = f"Reg: {r.registration_number}" if r.registration_number else f"Sol: {r.file_number}"
        print(f" {idx}. {r.title} (Clase {r.nice_class}) - {reg} - Titular: {r.owner} - Estado: {r.status} - Sim: {r.similarity_score}%")
    print()


def main():
    parser = argparse.ArgumentParser(description="MarcaCheck PY - Investigación y Viabilidad de Marcas (DINAPI + Tavily)")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcomando: investigate
    p_inv = subparsers.add_parser("investigate", help="Realizar investigación completa de viabilidad de marca")
    p_inv.add_argument("brand", help="Denominación de la marca a investigar")
    p_inv.add_argument("--clase", "-c", type=int, help="Número de clase Niza (1-45)", default=None)
    p_inv.add_argument("--categoria", "-cat", type=str, help="Rubro o descripción de actividad", default="")
    p_inv.add_argument("--tavily-key", "-k", type=str, help="Clave API de Tavily (o definir en .env)", default=None)
    p_inv.add_argument("--max-results", "-m", type=int, default=50, help="Máximo de registros a procesar")
    p_inv.add_argument("--output-html", "-html", type=str, help="Ruta de archivo para guardar reporte HTML")
    p_inv.add_argument("--output-md", "-md", type=str, help="Ruta de archivo para guardar reporte Markdown")
    p_inv.add_argument("--output-json", "-json", type=str, help="Ruta de archivo para guardar reporte JSON")
    p_inv.set_defaults(func=cmd_investigate)

    # Subcomando: niza
    p_niza = subparsers.add_parser("niza", help="Buscar clases Niza por número o actividad")
    p_niza.add_argument("query", help="Número de clase (1-45) o término de búsqueda (ej. cerveza, software)")
    p_niza.set_defaults(func=cmd_niza)

    # Subcomando: dinapi
    p_dinapi = subparsers.add_parser("dinapi", help="Consulta directa a la base de marcas de la DINAPI")
    p_dinapi.add_argument("term", help="Término o nombre de marca a buscar")
    p_dinapi.add_argument("--clase", "-c", type=int, help="Número de clase Niza")
    p_dinapi.add_argument("--tipo", choices=["contenga", "exacta", "fonetica"], default="contenga")
    p_dinapi.set_defaults(func=cmd_dinapi_direct)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
