"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle, Scale, ArrowRight, BookOpen } from "lucide-react";
import { ClearanceVerdict } from "@/lib/clearance";

interface VerdictBadgeProps {
  verdict: ClearanceVerdict;
  brandName: string;
}

export default function VerdictBadge({ verdict, brandName }: VerdictBadgeProps) {
  const isSafe = verdict.risk_level === "BAJO";
  const isMedium = verdict.risk_level === "MEDIO";
  const isHigh = verdict.risk_level === "ALTO";
  const isCritical = verdict.risk_level === "CRÍTICO";

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-xl space-y-6">
      {/* Top Banner with Viability Gauge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Dictamen de Viabilidad Registral
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isSafe
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : isMedium
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  : isHigh
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isSafe && <CheckCircle className="h-3.5 w-3.5" />}
              {isMedium && <AlertTriangle className="h-3.5 w-3.5" />}
              {isHigh && <AlertTriangle className="h-3.5 w-3.5" />}
              {isCritical && <AlertOctagon className="h-3.5 w-3.5" />}
              RIESGO {verdict.risk_level}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white leading-tight">
            {verdict.headline}
          </h3>
        </div>

        {/* Big Score Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 px-5 py-3 text-center min-w-[110px]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Viabilidad
            </span>
            <span
              className={`text-2xl font-black ${
                verdict.viability_score >= 70
                  ? "text-emerald-400"
                  : verdict.viability_score >= 40
                  ? "text-yellow-400"
                  : "text-rose-400"
              }`}
            >
              {verdict.viability_score}%
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 px-5 py-3 text-center min-w-[110px]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Riesgo
            </span>
            <span
              className={`text-2xl font-black ${
                verdict.risk_score >= 70
                  ? "text-rose-400"
                  : verdict.risk_score >= 35
                  ? "text-yellow-400"
                  : "text-emerald-400"
              }`}
            >
              {verdict.risk_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Legal Basis & Strategic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
        {/* Legal basis */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Scale className="h-4 w-4 text-blue-400" />
            <span>Fundamentos de Derecho (Ley 1294/98)</span>
          </div>
          {verdict.legal_basis.length === 0 ? (
            <p className="text-xs text-slate-400">
              No se detectaron impedimentos normativos tipificados en el Art. 2 de la Ley 1294/98.
            </p>
          ) : (
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              {verdict.legal_basis.map((lb, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>
                  <span>{lb}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span>Recomendaciones Estratégicas</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
            {verdict.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
