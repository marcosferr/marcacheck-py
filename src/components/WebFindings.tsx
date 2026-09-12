"use client";

import React from "react";
import { Globe, ExternalLink, ShieldCheck, MapPin, Tag, Share2, AlertTriangle } from "lucide-react";
import { BrandWebReport } from "@/lib/tavily";

interface WebFindingsProps {
  webReport: BrandWebReport;
  brandName: string;
}

export default function WebFindings({ webReport, brandName }: WebFindingsProps) {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div
        className={`rounded-2xl border p-4.5 ${
          webReport.py_presence_detected
            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
            : "border-slate-800 bg-slate-900/60 text-slate-300"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              webReport.py_presence_detected
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}
          >
            <Globe className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-white">
                Inteligencia de Mercado Web (Tavily AI Search)
              </h4>
              {webReport.py_presence_detected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/30">
                  <MapPin className="h-3 w-3" /> Presencia en Paraguay detectada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" /> Sin conflicto previo local detectado
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {webReport.summary || "No se detectó actividad comercial conflictiva previa para esta marca."}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Classes from web context */}
      {webReport.suggested_niza_classes && webReport.suggested_niza_classes.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-200">
              Clases Niza sugeridas por actividad detectada:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {webReport.suggested_niza_classes.map((cls) => (
              <div
                key={cls.number}
                className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-xs text-blue-300 flex items-center gap-1.5"
              >
                <span className="font-bold text-blue-400">Clase {cls.number}:</span>
                <span>{cls.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Profiles */}
      {webReport.social_profiles && webReport.social_profiles.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-semibold text-slate-200">
              Perfiles y canales identificados:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {webReport.social_profiles.map((sp, idx) => (
              <a
                key={idx}
                href={sp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
              >
                <span className="font-medium text-violet-300">{sp.platform}</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Search results list */}
      <div className="space-y-2.5">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Resultados web analizados ({webReport.results.length})
        </h5>

        {webReport.results.length === 0 ? (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
            No se hallaron enlaces directos en el rastreo de Tavily.
          </div>
        ) : (
          webReport.results.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-xs text-blue-400 hover:underline flex items-center gap-1.5"
                >
                  <span className="truncate max-w-[400px]">{r.title || r.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                {r.is_local_py && (
                  <span className="shrink-0 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/20">
                    .PY / Paraguay
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5 mb-1">
                {r.domain}
              </div>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {r.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
