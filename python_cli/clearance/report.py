"""
Generador de Reportes de Viabilidad de Marca (HTML, Markdown y JSON).
"""

import json
from typing import Dict, Any
from .engine import InvestigationReport

def generate_markdown_report(report: InvestigationReport) -> str:
    """Genera un informe ejecutivo en formato Markdown."""
    v = report.verdict
    cls_text = f"Clase {report.target_class}" if report.target_class else "Todas las clases"
    if report.class_info:
        cls_text += f" ({report.class_info.get('title', '')})"

    color_emoji = {
        "green": "🟢",
        "yellow": "🟡",
        "orange": "🟠",
        "red": "🔴"
    }.get(v.risk_color, "⚪")

    md = []
    md.append(f"# Informe de Investigación de Marca: **{report.brand_name.upper()}**")
    md.append(f"**Fecha y Hora:** {report.timestamp} | **Clase Niza:** {cls_text}")
    md.append(f"**Veredicto de Viabilidad:** {color_emoji} **{v.risk_level}** (Viabilidad: {v.viability_score}% / Riesgo: {v.risk_score}%)")
    md.append(f"\n> **Dictamen:** {v.headline}\n")

    md.append("## 1. Fundamentos Legales y Doctrinales (Ley 1294/98)")
    for lb in v.legal_basis:
        md.append(f"- {lb}")
    if not v.legal_basis:
        md.append("- No se detectaron objeciones jurídicas bajo los artículos de la Ley de Marcas de Paraguay.")

    md.append("\n## 2. Antecedentes Registrales en DINAPI")
    md.append(f"- Total de registros analizados: {report.dinapi_summary.get('total_found', 0)}")
    if report.dinapi_summary.get("is_truncated"):
        md.append(f"- *Nota: Búsqueda amplia con más de {report.dinapi_summary.get('total_potential', 0)} registros en base.*")

    if v.blocking_records:
        md.append("\n### ⚠️ Obstáculos Registrales Directos (Misma Clase / Identidad o Alta Similitud)")
        md.append("| Signo | Clase | Titular | N° Registro | Solicitud | Estado | Similitud |")
        md.append("|---|---|---|---|---|---|---|")
        for r in v.blocking_records:
            md.append(f"| **{r.get('title')}** | {r.get('nice_class')} | {r.get('owner')} | {r.get('registration_number') or '-'} | {r.get('file_number')} | {r.get('status')} | {r.get('similarity_score')}% |")
    else:
        md.append("\n- ✅ **Sin obstáculos directos:** No se encontraron marcas idénticas ni cuasi-idénticas vigentes en la misma clase.")

    if v.related_records:
        md.append("\n### Signos Similares o en Clases Conexas")
        md.append("| Signo | Clase | Titular | Estado | Similitud |")
        md.append("|---|---|---|---|---|")
        for r in v.related_records[:8]:
            md.append(f"| {r.get('title')} | {r.get('nice_class')} | {r.get('owner')} | {r.get('status')} | {r.get('similarity_score')}% |")

    md.append("\n## 3. Inteligencia de Mercado Web (Tavily Search)")
    wf = v.web_findings
    md.append(f"- **Consulta Web:** `{report.web_summary.get('query_used', '')}`")
    md.append(f"- **Presencia Local (.py / Paraguay):** {'Detectada ⚠️' if wf.get('py_detected') else 'No detectada explícitamente ✅'}")
    md.append(f"- **Resumen:** {wf.get('summary', 'Sin datos')}")

    if wf.get("social_profiles"):
        md.append("\n### Perfiles en Redes Sociales Detectados:")
        for sp in wf["social_profiles"]:
            md.append(f"- **{sp.get('platform')}:** [{sp.get('title')}]({sp.get('url')})")

    if wf.get("suggested_niza"):
        md.append("\n### Clases Niza Recomendadas por Actividad Comercial:")
        for sn in wf["suggested_niza"]:
            md.append(f"- **Clase {sn.get('class_number')}** ({sn.get('category')}): {sn.get('title')} - *{sn.get('description')}*")

    md.append("\n## 4. Recomendaciones Estratégicas")
    for rec in v.recommendations:
        md.append(f"- {rec}")

    md.append("\n---\n*Reporte generado por MarcaCheck PY - Motor de Inteligencia Marcaria (DINAPI + Tavily).*")
    return "\n".join(md)


def generate_html_report(report: InvestigationReport) -> str:
    """Genera un reporte interactivo con estilo profesional, dashboard y listo para imprimir."""
    v = report.verdict
    badge_colors = {
        "green": ("#dcfce7", "#166534", "Riesgo Bajo"),
        "yellow": ("#fef9c3", "#854d0e", "Riesgo Medio"),
        "orange": ("#ffedd5", "#9a3412", "Riesgo Alto"),
        "red": ("#fee2e2", "#991b1b", "Riesgo Crítico")
    }.get(v.risk_color, ("#e2e8f0", "#1e293b", v.risk_level))

    bg_badge, text_badge, label_badge = badge_colors

    cls_str = f"Clase Niza {report.target_class}" if report.target_class else "Todas las clases"
    if report.class_info:
        cls_str += f" - {report.class_info.get('title', '')}"

    blocking_rows = ""
    for r in v.blocking_records:
        blocking_rows += f"""
        <tr>
            <td class="fw-bold">{r.get('title')}</td>
            <td><span class="badge bg-secondary">Clase {r.get('nice_class')}</span></td>
            <td>{r.get('owner')}</td>
            <td>{r.get('registration_number') or '-'}</td>
            <td>{r.get('file_number')}</td>
            <td><span class="status-pill">{r.get('status')}</span></td>
            <td class="fw-bold text-danger">{r.get('similarity_score')}%</td>
        </tr>
        """

    related_rows = ""
    for r in v.related_records[:10]:
        related_rows += f"""
        <tr>
            <td>{r.get('title')}</td>
            <td>Clase {r.get('nice_class')}</td>
            <td>{r.get('owner')}</td>
            <td>{r.get('status')}</td>
            <td>{r.get('similarity_score')}%</td>
        </tr>
        """

    legal_items = "".join([f"<li>{item}</li>" for item in v.legal_basis]) or "<li>Sin objeciones directas preliminares bajo la Ley 1294/98.</li>"
    rec_items = "".join([f"<li><strong>Recomendación:</strong> {item}</li>" for item in v.recommendations])

    web_results_html = ""
    for wr in report.web_summary.get("results", [])[:5]:
        web_results_html += f"""
        <div class="web-result-card">
            <a href="{wr.get('url')}" target="_blank" class="web-result-title">{wr.get('title')}</a>
            <div class="web-result-url">{wr.get('url')}</div>
            <p class="web-result-snippet">{wr.get('content')}</p>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Viabilidad de Marca - {report.brand_name.upper()}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary: #1e3a8a;
            --primary-light: #3b82f6;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }}
        body {{ background-color: var(--bg); color: var(--text-main); line-height: 1.6; padding: 30px 20px; }}
        .container {{ max-width: 1000px; margin: 0 auto; }}
        .header-card {{ background: var(--card-bg); border-radius: 12px; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border); margin-bottom: 24px; }}
        .header-top {{ display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 16px; }}
        .brand-title {{ font-size: 28px; font-weight: 700; color: var(--primary); }}
        .meta-info {{ color: var(--text-muted); font-size: 14px; }}
        .badge-risk {{ background: {bg_badge}; color: {text_badge}; font-weight: 700; padding: 8px 16px; border-radius: 50px; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; }}
        .meter-box {{ display: flex; gap: 20px; align-items: center; margin-top: 15px; }}
        .score-circle {{ width: 84px; height: 84px; border-radius: 50%; background: {bg_badge}; color: {text_badge}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; }}
        .score-number {{ font-size: 24px; line-height: 1; }}
        .score-label {{ font-size: 10px; text-transform: uppercase; margin-top: 2px; }}
        .headline-box {{ flex: 1; font-size: 16px; font-weight: 500; }}
        
        .section-card {{ background: var(--card-bg); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid var(--border); }}
        .section-title {{ font-size: 18px; font-weight: 600; color: var(--primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }}
        
        table {{ width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13.5px; }}
        th {{ background: #f1f5f9; text-align: left; padding: 10px 12px; color: var(--text-muted); font-weight: 600; border-bottom: 2px solid var(--border); }}
        td {{ padding: 10px 12px; border-bottom: 1px solid var(--border); }}
        tr:hover td {{ background: #f8fafc; }}
        .fw-bold {{ font-weight: 600; }}
        .text-danger {{ color: #dc2626; }}
        .badge {{ display: inline-block; padding: 3px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #e2e8f0; }}
        .status-pill {{ background: #eff6ff; color: #1e40af; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }}
        
        ul.styled-list {{ padding-left: 20px; }}
        ul.styled-list li {{ margin-bottom: 8px; }}
        
        .web-result-card {{ padding: 12px 14px; border-radius: 8px; background: #f8fafc; border: 1px solid var(--border); margin-bottom: 10px; }}
        .web-result-title {{ font-weight: 600; color: #2563eb; text-decoration: none; font-size: 15px; }}
        .web-result-title:hover {{ text-decoration: underline; }}
        .web-result-url {{ font-size: 12px; color: #16a34a; margin-bottom: 4px; word-break: break-all; }}
        .web-result-snippet {{ font-size: 13px; color: #475569; }}
        
        .print-btn {{ background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }}
        .print-btn:hover {{ background: var(--primary-light); }}
        @media print {{
            body {{ padding: 0; background: white; }}
            .print-btn {{ display: none; }}
            .section-card, .header-card {{ box-shadow: none; }}
        }}
    </style>
</head>
<body>
<div class="container">
    <div class="header-card">
        <div class="header-top">
            <div>
                <span class="meta-info">MarcaCheck PY - Dictamen Oficial y de Mercado</span>
                <h1 class="brand-title">Marca: {report.brand_name.upper()}</h1>
                <div class="meta-info">{cls_str} • Fecha: {report.timestamp}</div>
            </div>
            <div style="text-align: right;">
                <div class="badge-risk">● {label_badge}</div>
                <div style="margin-top: 10px;"><button class="print-btn" onclick="window.print()">Imprimir / Guardar PDF</button></div>
            </div>
        </div>
        <div class="meter-box">
            <div class="score-circle">
                <span class="score-number">{v.viability_score}%</span>
                <span class="score-label">Viabilidad</span>
            </div>
            <div class="headline-box">
                <p>{v.headline}</p>
            </div>
        </div>
    </div>

    <!-- Sección 1: DINAPI -->
    <div class="section-card">
        <div class="section-title">⚖️ Registros Oficiales DINAPI (Paraguay)</div>
        <p class="meta-info">Registros analizados en el sistema IPAS: <strong>{report.dinapi_summary.get('total_found', 0)}</strong></p>
        
        {f'''
        <h4 style="margin-top: 15px; font-size: 14px; color: #991b1b;">⚠️ Antecedentes con Riesgo Directo:</h4>
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>Signo</th><th>Clase</th><th>Titular</th><th>N° Reg.</th><th>Solicitud</th><th>Estado</th><th>Similitud</th>
                    </tr>
                </thead>
                <tbody>
                    {blocking_rows}
                </tbody>
            </table>
        </div>
        ''' if v.blocking_records else '<p style="color: #15803d; margin-top: 10px;">✅ No se encontraron marcas idénticas ni conflictos insalvables en trámite o concedidas en esta clase.</p>'}

        {f'''
        <h4 style="margin-top: 20px; font-size: 14px; color: #475569;">Otros Signos Semajantes o en Clases Conexas:</h4>
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr><th>Signo</th><th>Clase</th><th>Titular</th><th>Estado</th><th>Similitud</th></tr>
                </thead>
                <tbody>
                    {related_rows}
                </tbody>
            </table>
        </div>
        ''' if v.related_records else ''}
    </div>

    <!-- Sección 2: Tavily Search -->
    <div class="section-card">
        <div class="section-title">🌐 Inteligencia de Mercado y Presencia Web (Tavily)</div>
        <p style="margin-bottom: 12px; font-size: 14px;"><strong>Diagnóstico de Mercado:</strong> {v.web_findings.get('summary', 'Sin información')}</p>
        {web_results_html if web_results_html else '<p class="meta-info">No se detectaron marcas de hecho idénticas en el comercio web paraguayo.</p>'}
    </div>

    <!-- Sección 3: Fundamentos Legales y Recomendaciones -->
    <div class="section-card">
        <div class="section-title">📋 Fundamentos y Recomendaciones Estratégicas</div>
        <h4 style="font-size: 14px; margin-bottom: 6px; color: var(--primary);">Fundamento en Ley de Marcas N° 1294/98:</h4>
        <ul class="styled-list" style="margin-bottom: 16px;">
            {legal_items}
        </ul>
        <h4 style="font-size: 14px; margin-bottom: 6px; color: var(--primary);">Estrategia de Protección Aconsejada:</h4>
        <ul class="styled-list">
            {rec_items}
        </ul>
    </div>
</div>
</body>
</html>
    """
    return html
