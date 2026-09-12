#!/usr/bin/env python3
"""
Servidor Web y Aplicación Interactiva de MarcaCheck PY.
Investigación de Viabilidad de Marcas con DINAPI (Paraguay) y Tavily Web Search.
Autónomo, moderno y sin dependencias obligatorias externas.
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

from dinapi.client import DINAPIClient
from web_intelligence.tavily_client import TavilyBrandResearcher
from clearance.engine import BrandClearanceEngine
from clearance.report import generate_html_report, generate_markdown_report
from data.niza import NIZA_CLASSES, search_niza_classes, get_niza_class

# Cargar variables de entorno desde .env si existe
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

HTML_PAGE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarcaCheck PY - Investigación de Marca (DINAPI + Tavily)</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0f4c81;
            --primary-dark: #092c4d;
            --primary-light: #2563eb;
            --accent: #f59e0b;
            --bg: #f8fafc;
            --surface: #ffffff;
            --text-dark: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --danger: #ef4444;
            --warning: #f59e0b;
            --success: #10b981;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background-color: var(--bg); color: var(--text-dark); min-height: 100vh; display: flex; flex-direction: column; }

        header {
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
            color: white;
            padding: 24px 20px;
            box-shadow: 0 4px 20px rgba(15, 76, 129, 0.15);
        }
        .header-content {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        .logo-box h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
        .logo-box p { font-size: 13px; color: #93c5fd; margin-top: 2px; }
        .badge-py { background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }

        main { max-width: 1100px; margin: 30px auto; padding: 0 20px; flex: 1; width: 100%; }

        .search-card {
            background: var(--surface);
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            border: 1px solid var(--border);
            margin-bottom: 30px;
        }
        .form-grid {
            display: grid;
            grid-template-columns: 2fr 1.2fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
        }
        @media (max-width: 800px) {
            .form-grid { grid-template-columns: 1fr; }
        }

        .form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
        .form-control {
            width: 100%;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid var(--border);
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
            background: #fff;
        }
        .form-control:focus { border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

        .form-options {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
        }
        @media (max-width: 800px) {
            .form-options { grid-template-columns: 1fr; }
        }

        .actions-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            padding-top: 14px;
            border-top: 1px solid var(--border);
        }

        .quick-examples { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; color: var(--text-muted); }
        .example-chip {
            background: #f1f5f9;
            border: 1px solid var(--border);
            padding: 4px 10px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.15s;
        }
        .example-chip:hover { background: #e2e8f0; color: var(--primary); }

        .btn-submit {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(37,99,235,0.25);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37,99,235,0.35); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Loader */
        .loading-state {
            display: none;
            background: var(--surface);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            border: 1px solid var(--border);
            margin-bottom: 30px;
        }
        .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top-color: var(--primary-light);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Results Area */
        #resultsArea { display: none; }

        .verdict-banner {
            border-radius: 16px;
            padding: 24px 28px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.03);
            border: 1px solid var(--border);
            background: white;
        }
        .verdict-info { flex: 1; min-width: 260px; }
        .verdict-pill {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }
        .pill-green { background: #dcfce7; color: #15803d; }
        .pill-yellow { background: #fef9c3; color: #a16207; }
        .pill-orange { background: #ffedd5; color: #c2410c; }
        .pill-red { background: #fee2e2; color: #b91c1c; }

        .verdict-headline { font-size: 17px; font-weight: 700; line-height: 1.4; color: var(--text-dark); }
        .verdict-meta { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

        .gauge-box {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .score-circle {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            border: 5px solid;
        }
        .score-green { border-color: #10b981; color: #047857; background: #ecfdf5; }
        .score-yellow { border-color: #f59e0b; color: #b45309; background: #fffbeb; }
        .score-orange { border-color: #f97316; color: #c2410c; background: #fff7ed; }
        .score-red { border-color: #ef4444; color: #b91c1c; background: #fef2f2; }

        .grid-sections {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
        }

        .card {
            background: var(--surface);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 16px rgba(0,0,0,0.02);
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
        }
        .card-title { font-size: 16px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 8px; }

        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 10px 12px; background: #f8fafc; color: var(--text-muted); font-weight: 600; border-bottom: 2px solid var(--border); }
        td { padding: 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        tr:hover td { background: #f8fafc; }

        .badge-status {
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
        }
        .badge-concedida { background: #dcfce7; color: #166534; }
        .badge-tramite { background: #eff6ff; color: #1e40af; }
        .badge-otra { background: #f1f5f9; color: #475569; }

        .web-item {
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 12px;
        }
        .web-item a { color: var(--primary-light); font-weight: 600; font-size: 14px; text-decoration: none; }
        .web-item a:hover { text-decoration: underline; }
        .web-url { font-size: 12px; color: #059669; margin: 2px 0 6px; word-break: break-all; }
        .web-snippet { font-size: 13px; color: var(--text-dark); line-height: 1.5; }

        .rec-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px 0;
            border-bottom: 1px dashed var(--border);
            font-size: 13.5px;
        }
        .rec-item:last-child { border-bottom: none; }
        .rec-icon { color: var(--primary-light); font-weight: bold; }

        .btn-export {
            background: white;
            border: 1px solid var(--border);
            color: var(--text-dark);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-export:hover { background: #f1f5f9; border-color: #cbd5e1; }

        footer { text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; margin-top: auto; border-top: 1px solid var(--border); }
    </style>
</head>
<body>

<header>
    <div class="header-content">
        <div class="logo-box">
            <h1>⚖️ MarcaCheck PY <span class="badge-py">Paraguay</span></h1>
            <p>Investigación Oficial en DINAPI + Inteligencia de Mercado Web con Tavily</p>
        </div>
        <div>
            <span style="font-size: 13px; opacity: 0.9;">Ley de Marcas N° 1294/98</span>
        </div>
    </div>
</header>

<main>
    <div class="search-card">
        <form id="searchForm" onsubmit="event.preventDefault(); runInvestigation();">
            <div class="form-grid">
                <div class="form-group">
                    <label for="brandName">Nombre de la Marca a Investigar *</label>
                    <input type="text" id="brandName" class="form-control" placeholder="Ej. GUARANA FRESH, INNOVA, CHIPARTE" required>
                </div>
                <div class="form-group">
                    <label for="niceClass">Clase Niza (1 a 45)</label>
                    <select id="niceClass" class="form-control">
                        <option value="">-- Todas las Clases / Auto-detectar --</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="maxResults">Máx. Resultados DINAPI</label>
                    <select id="maxResults" class="form-control">
                        <option value="30">30 registros</option>
                        <option value="50" selected>50 registros</option>
                        <option value="100">100 registros</option>
                    </select>
                </div>
            </div>

            <div class="form-options">
                <div class="form-group">
                    <label for="categoryHint">Rubro o Descripción del Producto / Servicio (Opcional)</label>
                    <input type="text" id="categoryHint" class="form-control" placeholder="Ej. Bebidas no alcohólicas, software para empresas, restaurante">
                </div>
                <div class="form-group">
                    <label for="tavilyKey">Tavily API Key (Opcional, para búsqueda web en vivo)</label>
                    <input type="password" id="tavilyKey" class="form-control" placeholder="tvly-xxxxxxxxxxxx">
                </div>
            </div>

            <div class="actions-row">
                <div class="quick-examples">
                    <span>Ejemplos rápidos:</span>
                    <span class="example-chip" onclick="setExample('GUARANA', 32, 'Bebidas')">Guaraná (Clase 32)</span>
                    <span class="example-chip" onclick="setExample('TERERE FIT', 30, 'Yerba mate y té')">Tereré Fit (Clase 30)</span>
                    <span class="example-chip" onclick="setExample('CLOUDTECH', 42, 'Software SaaS')">CloudTech (Clase 42)</span>
                    <span class="example-chip" onclick="setExample('BURGER STOP', 43, 'Comida rápida')">Burger Stop (Clase 43)</span>
                </div>
                <button type="submit" id="btnSubmit" class="btn-submit">
                    <span>🔍 Analizar Viabilidad</span>
                </button>
            </div>
        </form>
    </div>

    <!-- Indicador de carga -->
    <div id="loadingBox" class="loading-state">
        <div class="spinner"></div>
        <h3 style="font-size: 18px; margin-bottom: 8px;">Investigando antecedentes marcarios...</h3>
        <p style="font-size: 14px; color: var(--text-muted);" id="loadingStatus">Consultando base de datos oficial de DINAPI y analizando fonética...</p>
    </div>

    <!-- Resultados -->
    <div id="resultsArea">
        <div class="verdict-banner" id="verdictBanner">
            <div class="verdict-info">
                <div id="riskPill" class="verdict-pill pill-green">Riesgo Bajo</div>
                <div class="verdict-headline" id="verdictHeadline">-</div>
                <div class="verdict-meta" id="verdictMeta">-</div>
            </div>
            <div class="gauge-box">
                <div class="score-circle score-green" id="scoreCircle">
                    <span style="font-size: 26px; line-height: 1;" id="viabilityVal">90%</span>
                    <span style="font-size: 10px; text-transform: uppercase;">Viabilidad</span>
                </div>
                <button class="btn-export" onclick="exportHtml()">🖨️ Exportar Informe</button>
            </div>
        </div>

        <div class="grid-sections">
            <!-- DINAPI Records -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">⚖️ Antecedentes Oficiales DINAPI (Paraguay)</div>
                    <span style="font-size: 13px; color: var(--text-muted);" id="dinapiCount">0 registros encontrados</span>
                </div>
                <div style="overflow-x: auto;">
                    <table id="dinapiTable">
                        <thead>
                            <tr>
                                <th>Marca Registrada</th>
                                <th>Clase</th>
                                <th>Titular</th>
                                <th>Registro / Solicitud</th>
                                <th>Estado</th>
                                <th>Vencimiento</th>
                                <th>Similitud</th>
                            </tr>
                        </thead>
                        <tbody id="dinapiRows">
                        </tbody>
                    </table>
                </div>
                <p id="noDinapiMsg" style="display: none; color: #16a34a; padding: 15px 0; font-weight: 500;">
                    ✅ No se detectaron marcas con riesgo directo en DINAPI.
                </p>
            </div>

            <!-- Tavily Web Intelligence -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">🌐 Inteligencia de Mercado y Presencia Web (Tavily)</div>
                    <span id="webPresencePill" class="badge-status badge-tramite">Sin presencia .py</span>
                </div>
                <p id="webSummaryText" style="font-size: 14px; margin-bottom: 16px; line-height: 1.5; color: #334155;"></p>
                <div id="webList"></div>
            </div>

            <!-- Recomendaciones y Fundamentos -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">📋 Fundamentos y Recomendaciones Estratégicas</div>
                </div>
                <div style="margin-bottom: 16px;">
                    <h4 style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Fundamentos Legales Aplicables:</h4>
                    <div id="legalList"></div>
                </div>
                <div>
                    <h4 style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Estrategia Sugerida de Registro:</h4>
                    <div id="recList"></div>
                </div>
            </div>
        </div>
    </div>
</main>

<footer>
    MarcaCheck PY • Sistema de Inteligencia Marcaria y Consulta Oficial DINAPI • Desarrollado para Paraguay
</footer>

<script>
    let currentReport = null;

    // Cargar selector de Clases Niza
    async function initNizaOptions() {
        try {
            const resp = await fetch('/api/niza/all');
            const data = await resp.json();
            const select = document.getElementById('niceClass');
            data.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.number;
                opt.textContent = `Clase ${c.number} (${c.category}): ${c.title}`;
                select.appendChild(opt);
            });
        } catch(e) {
            console.error("Error al cargar clases Niza:", e);
        }
    }
    initNizaOptions();

    // Cargar clave guardada en localStorage si existe
    const savedKey = localStorage.getItem('mc_tavily_key');
    if (savedKey) {
        document.getElementById('tavilyKey').value = savedKey;
    }

    function setExample(brand, cls, cat) {
        document.getElementById('brandName').value = brand;
        document.getElementById('niceClass').value = cls || "";
        document.getElementById('categoryHint').value = cat || "";
    }

    async function runInvestigation() {
        const brand = document.getElementById('brandName').value.trim();
        const niceClass = document.getElementById('niceClass').value;
        const category = document.getElementById('categoryHint').value.trim();
        const tavilyKey = document.getElementById('tavilyKey').value.trim();
        const maxResults = parseInt(document.getElementById('maxResults').value) || 50;

        if (!brand) return;

        if (tavilyKey) {
            localStorage.setItem('mc_tavily_key', tavilyKey);
        }

        // UI states
        document.getElementById('btnSubmit').disabled = true;
        document.getElementById('loadingBox').style.display = 'block';
        document.getElementById('resultsArea').style.display = 'none';

        try {
            const resp = await fetch('/api/investigate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand: brand,
                    nice_class: niceClass ? parseInt(niceClass) : null,
                    category: category,
                    tavily_key: tavilyKey,
                    max_results: maxResults
                })
            });

            if (!resp.ok) {
                const errData = await resp.json();
                throw new Error(errData.error || "Error en el servidor");
            }

            const data = await resp.json();
            currentReport = data;
            renderResults(data);

        } catch (err) {
            alert("Error al investigar marca: " + err.message);
        } finally {
            document.getElementById('btnSubmit').disabled = false;
            document.getElementById('loadingBox').style.display = 'none';
        }
    }

    function renderResults(report) {
        const v = report.verdict;
        document.getElementById('resultsArea').style.display = 'block';

        // Verdict banner
        const pill = document.getElementById('riskPill');
        pill.className = `verdict-pill pill-${v.risk_color}`;
        pill.textContent = `Riesgo ${v.risk_level}`;

        document.getElementById('verdictHeadline').textContent = v.headline;
        document.getElementById('verdictMeta').textContent = `Marca: ${report.brand_name.toUpperCase()} • ${report.target_class ? 'Clase ' + report.target_class : 'Todas las Clases'} • Evaluado: ${report.timestamp}`;

        const circle = document.getElementById('scoreCircle');
        circle.className = `score-circle score-${v.risk_color}`;
        document.getElementById('viabilityVal').textContent = `${v.viability_score}%`;

        // DINAPI Records
        const records = report.dinapi_summary.records || [];
        document.getElementById('dinapiCount').textContent = `${records.length} registros evaluados`;

        const tbody = document.getElementById('dinapiRows');
        tbody.innerHTML = '';

        if (records.length === 0) {
            document.getElementById('noDinapiMsg').style.display = 'block';
            document.getElementById('dinapiTable').style.display = 'none';
        } else {
            document.getElementById('noDinapiMsg').style.display = 'none';
            document.getElementById('dinapiTable').style.display = 'table';

            records.slice(0, 25).forEach(r => {
                const tr = document.createElement('tr');
                const st = (r.status || "").toLowerCase();
                let stClass = "badge-otra";
                if (st.includes("concedida") || st.includes("renovada")) stClass = "badge-concedida";
                else if (st.includes("tramite") || st.includes("trámite")) stClass = "badge-tramite";

                const regText = r.registration_number ? `Reg: ${r.registration_number}` : `Sol: ${r.file_number}`;
                const simColor = r.similarity_score >= 80 ? 'color: #dc2626; font-weight: 700;' : (r.similarity_score >= 50 ? 'color: #d97706; font-weight: 600;' : 'color: #059669;');

                tr.innerHTML = `
                    <td class="fw-bold">${r.title}</td>
                    <td><span class="badge bg-secondary">Clase ${r.nice_class || '-'}</span></td>
                    <td>${r.owner || '-'}</td>
                    <td>${regText}</td>
                    <td><span class="badge-status ${stClass}">${r.status}</span></td>
                    <td>${r.expiration_date || '-'}</td>
                    <td style="${simColor}">${r.similarity_score}%</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Web Intelligence
        const web = report.web_summary;
        const webPill = document.getElementById('webPresencePill');
        if (web.py_presence_detected) {
            webPill.className = "badge-status badge-concedida";
            webPill.textContent = "Presencia Local en Paraguay (.py)";
        } else {
            webPill.className = "badge-status badge-otra";
            webPill.textContent = "Sin presencia directa en .py";
        }

        document.getElementById('webSummaryText').textContent = web.summary || "No se detectó actividad comercial conflictiva en la web.";

        const webList = document.getElementById('webList');
        webList.innerHTML = '';
        const webResults = web.results || [];
        if (webResults.length > 0) {
            webResults.slice(0, 5).forEach(w => {
                const div = document.createElement('div');
                div.className = 'web-item';
                div.innerHTML = `
                    <a href="${w.url}" target="_blank">${w.title}</a>
                    <div class="web-url">${w.url}</div>
                    <p class="web-snippet">${w.content}</p>
                `;
                webList.appendChild(div);
            });
        } else {
            webList.innerHTML = '<p style="font-size: 13px; color: var(--text-muted);">No se requirieron o encontraron fuentes externas directas.</p>';
        }

        // Fundamentos y Recomendaciones
        const legalList = document.getElementById('legalList');
        legalList.innerHTML = '';
        v.legal_basis.forEach(lb => {
            const d = document.createElement('div');
            d.className = 'rec-item';
            d.innerHTML = `<span class="rec-icon">⚖️</span> <span>${lb}</span>`;
            legalList.appendChild(d);
        });

        const recList = document.getElementById('recList');
        recList.innerHTML = '';
        v.recommendations.forEach(rec => {
            const d = document.createElement('div');
            d.className = 'rec-item';
            d.innerHTML = `<span class="rec-icon">💡</span> <span>${rec}</span>`;
            recList.appendChild(d);
        });

        // Scroll down
        document.getElementById('resultsArea').scrollIntoView({ behavior: 'smooth' });
    }

    function exportHtml() {
        if (!currentReport) return;
        window.open(`/api/export/html?brand=${encodeURIComponent(currentReport.brand_name)}`, '_blank');
    }
</script>

</body>
</html>
"""

class MarcaCheckHandler(BaseHTTPRequestHandler):
    """Manejador HTTP para la API y la UI de MarcaCheck PY."""

    engine = BrandClearanceEngine()
    last_report = None

    def _send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, html_text: str, status: int = 200):
        body = html_text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)

        # 1. Home
        if path == "/" or path == "/index.html":
            self._send_html(HTML_PAGE)
            return

        # 2. Clases Niza completas
        elif path == "/api/niza/all":
            classes_list = [
                {
                    "number": c.number,
                    "category": c.category,
                    "title": c.title,
                    "description": c.description,
                    "related_classes": c.related_classes
                }
                for c in NIZA_CLASSES.values()
            ]
            self._send_json(classes_list)
            return

        # 3. Búsqueda de clases Niza
        elif path == "/api/niza/search":
            q = qs.get("q", [""])[0]
            matched = search_niza_classes(q)
            self._send_json([
                {
                    "number": c.number,
                    "category": c.category,
                    "title": c.title,
                    "description": c.description
                }
                for c in matched
            ])
            return

        # 4. Exportar reporte HTML
        elif path == "/api/export/html":
            if MarcaCheckHandler.last_report:
                html = generate_html_report(MarcaCheckHandler.last_report)
                self._send_html(html)
            else:
                self._send_html("<h1>No hay reporte generado previamente</h1>", 404)
            return

        else:
            self.send_error(404, "Ruta no encontrada")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/investigate":
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(raw_body)
            except Exception:
                self._send_json({"error": "JSON inválido"}, 400)
                return

            brand = payload.get("brand", "").strip()
            if not brand:
                self._send_json({"error": "El nombre de la marca es obligatorio"}, 400)
                return

            nice_class = payload.get("nice_class")
            if nice_class is not None and str(nice_class).strip() != "":
                nice_class = int(nice_class)
            else:
                nice_class = None

            category = payload.get("category", "").strip()
            tavily_key = payload.get("tavily_key", "").strip() or os.environ.get("TAVILY_API_KEY", "")
            max_results = int(payload.get("max_results", 50))

            try:
                # Instanciar cliente Tavily con la clave especificada
                tavily = TavilyBrandResearcher(api_key=tavily_key)
                engine = BrandClearanceEngine(tavily_researcher=tavily)
                report = engine.investigate(
                    brand_name=brand,
                    nice_class=nice_class,
                    category_hint=category,
                    max_dinapi_results=max_results
                )
                MarcaCheckHandler.last_report = report
                self._send_json(report.to_dict())
            except Exception as e:
                self._send_json({"error": str(e)}, 500)
            return

        else:
            self.send_error(404, "Endpoint no encontrado")


def start_server(port: int = 8080):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, MarcaCheckHandler)
    print(f"\n🚀 Servidor MarcaCheck PY iniciado exitosamente!")
    print(f"👉 Abre en tu navegador: http://localhost:{port}")
    print(f"Presiona Ctrl+C para detener el servidor.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
        httpd.server_close()


if __name__ == "__main__":
    port = 8080
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    start_server(port)
