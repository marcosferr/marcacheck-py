"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  Globe,
  Bot,
  Sparkles,
  Scale,
  Settings,
  ArrowRight,
  Database,
  ExternalLink,
  Layers,
  FileCheck
} from "lucide-react";
import NizaSelector from "@/components/NizaSelector";
import DinapiTable from "@/components/DinapiTable";
import WebFindings from "@/components/WebFindings";
import VerdictBadge from "@/components/VerdictBadge";
import TrademarkChat from "@/components/TrademarkChat";
import SettingsModal from "@/components/SettingsModal";
import { InvestigationReport } from "@/lib/clearance";

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | undefined>(undefined);
  const [categoryHint, setCategoryHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"dictamen" | "dinapi" | "web" | "chat">("dictamen");

  // OpenAI API Key management
  const [openAiKey, setOpenAiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("marcacheck_openai_key");
      if (savedKey) {
        setOpenAiKey(savedKey);
      }
    }
  }, []);

  const handleInvestigate = async (targetName?: string, targetClassNum?: number) => {
    const term = (targetName !== undefined ? targetName : brandName).trim();
    const cls = targetClassNum !== undefined ? targetClassNum : selectedClass;

    if (!term) return;

    if (targetName) {
      setBrandName(targetName);
    }
    if (targetClassNum !== undefined) {
      setSelectedClass(targetClassNum);
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: term,
          nice_class: cls,
          category_hint: categoryHint,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Error al investigar la marca");
      }

      setReport(data.report);
      setActiveTab("dictamen");
    } catch (err: any) {
      setError(err.message || "No se pudo completar la consulta en DINAPI/Tavily.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        openAiKey={openAiKey}
        setOpenAiKey={setOpenAiKey}
      />

      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">
                  MarcaCheck<span className="text-blue-500">.py</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                  🇵🇾 Paraguay
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                DINAPI • Tavily AI Search • Asesor Legal OpenAI (Ley 1294/98)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                DINAPI Joaju Live
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                <Globe className="h-3 w-3" />
                Tavily Web
              </span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Configuración</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-8 w-full">
        {/* Search Header Banner */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/60 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-6 relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Investigación Integral de Viabilidad y Disponibilidad Marcaria
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Investiga marcas en Paraguay con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">DINAPI y Web Intelligence</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Cotejo fonético oficial en el sistema de la DINAPI, rastreo de uso previo no registrado en internet mediante Tavily, y dictamen de viabilidad legal con un Asesor AI especializado en la Ley 1294/98.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInvestigate();
            }}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 relative"
          >
            {/* Brand Input */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Denominación de la Marca *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ej: INDICIA, TEREREDEV, METRIKA..."
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 font-semibold uppercase tracking-wider focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Nice Class Selector */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clasificación de Niza
              </label>
              <NizaSelector
                selectedClass={selectedClass}
                onSelectClass={setSelectedClass}
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={loading || !brandName.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Investigando...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Investigar Marca</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Ejemplos de prueba:</span>
            <button
              type="button"
              onClick={() => handleInvestigate("indicia")}
              className="rounded-lg bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-slate-300 border border-slate-700/60 transition"
            >
              Indicia (Disponible)
            </button>
            <button
              type="button"
              onClick={() => handleInvestigate("tereredev", 42)}
              className="rounded-lg bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-slate-300 border border-slate-700/60 transition"
            >
              TerereDev (Clase 42)
            </button>
            <button
              type="button"
              onClick={() => handleInvestigate("metrika", 42)}
              className="rounded-lg bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-slate-300 border border-slate-700/60 transition"
            >
              Metrika (Conflicto Clase 42)
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Results Area */}
        {report ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Investigation Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tabs */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  onClick={() => setActiveTab("dictamen")}
                  className={`pb-3 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-2 ${
                    activeTab === "dictamen"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileCheck className="h-4 w-4" />
                  Dictamen Legal
                </button>
                <button
                  onClick={() => setActiveTab("dinapi")}
                  className={`pb-3 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-2 ${
                    activeTab === "dinapi"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Database className="h-4 w-4" />
                  Registros DINAPI ({report.dinapi_summary.records.length})
                </button>
                <button
                  onClick={() => setActiveTab("web")}
                  className={`pb-3 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-2 ${
                    activeTab === "web"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  Inteligencia Web ({report.web_summary.total_results})
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`lg:hidden pb-3 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-2 ${
                    activeTab === "chat"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Bot className="h-4 w-4" />
                  Asesor AI
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === "dictamen" && (
                <div className="space-y-6">
                  <VerdictBadge verdict={report.verdict} brandName={report.brand_name} />

                  {/* Summary of blocking/relevant records */}
                  {report.verdict.blocking_records.length > 0 && (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <h4 className="font-bold text-sm text-rose-300">
                          Antecedentes Críticos Detectados en DINAPI ({report.verdict.blocking_records.length})
                        </h4>
                      </div>
                      <DinapiTable records={report.verdict.blocking_records} targetBrand={report.brand_name} />
                    </div>
                  )}

                  {report.verdict.related_records.length > 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-200">
                          Otros Antecedentes Semblantes o Relacionados ({report.verdict.related_records.length})
                        </h4>
                        <button
                          onClick={() => setActiveTab("dinapi")}
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          Ver todos ({report.dinapi_summary.records.length}) <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                      <DinapiTable records={report.verdict.related_records.slice(0, 5)} targetBrand={report.brand_name} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "dinapi" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>
                      Registros cotejados en tiempo real contra el backend de DINAPI (Joaju/IPAS).
                    </span>
                    <span className="font-semibold text-slate-300">
                      Total: {report.dinapi_summary.records.length} marcas
                    </span>
                  </div>
                  <DinapiTable records={report.dinapi_summary.records} targetBrand={report.brand_name} />
                </div>
              )}

              {activeTab === "web" && (
                <WebFindings webReport={report.web_summary} brandName={report.brand_name} />
              )}

              {activeTab === "chat" && (
                <div className="lg:hidden h-[600px]">
                  <TrademarkChat
                    report={report}
                    openAiKey={openAiKey}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                  />
                </div>
              )}
            </div>

            {/* Right Column: AI Chat Panel (Sticky on Desktop) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-24 h-[calc(100vh-8rem)]">
              <TrademarkChat
                report={report}
                openAiKey={openAiKey}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          </div>
        ) : (
          /* Empty / Explanatory State */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Cotejo DINAPI Oficial</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consultas en tiempo real a la base oficial de marcas de Paraguay. Análisis fonético adaptado al español y guaraní para anticipar oposiciones y objeciones de oficio.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Inteligencia Web Tavily</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Búsqueda exhaustiva en internet y redes sociales de marcas de hecho no registradas o uso previo en el comercio paraguayo (.py) para prevenir litigios por uso anterior.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Asesor Legal OpenAI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Chat interactivo entrenado en la Ley 1294/98 con conocimiento completo del contexto de tu búsqueda. Responde sobre plazos, estrategias de registro y delimitación de clases Niza.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            MarcaCheck PY — Herramienta de Investigación Marcaria para la República del Paraguay
          </div>
          <div className="text-slate-400 flex items-center gap-4">
            <span>Ley N° 1294/98 &quot;De Marcas&quot;</span>
            <span>•</span>
            <span>DINAPI Joaju API</span>
            <span>•</span>
            <span>Tavily Search</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
