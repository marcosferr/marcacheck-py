"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, ShieldCheck, FileText, CheckCircle2, Clock, Ban } from "lucide-react";
import { DINAPIRecord } from "@/lib/dinapi";

interface DinapiTableProps {
  records: DINAPIRecord[];
  targetBrand: string;
}

export default function DinapiTable({ records, targetBrand }: DinapiTableProps) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "granted" | "pending">("all");

  const filtered = records.filter((r) => {
    const matchesText =
      !filter ||
      r.title.toLowerCase().includes(filter.toLowerCase()) ||
      r.owner.toLowerCase().includes(filter.toLowerCase()) ||
      r.nice_class.includes(filter) ||
      r.file_number.includes(filter) ||
      r.registration_number.includes(filter);

    if (!matchesText) return false;

    if (statusFilter === "active") return r.is_active;
    if (statusFilter === "granted") return r.is_granted;
    if (statusFilter === "pending") return r.is_pending;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por denominación, titular, clase, expediente..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Todos ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter("granted")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "granted"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Concedidas ({records.filter((r) => r.is_granted).length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            En trámite ({records.filter((r) => r.is_pending).length})
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Marca en DINAPI</th>
                <th className="py-3 px-3">Clase</th>
                <th className="py-3 px-4">Titular</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Expediente / Reg.</th>
                <th className="py-3 px-3">Similitud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No se encontraron registros que coincidan con el criterio seleccionado.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const isCritical = r.similarity_score >= 85 && r.is_active;
                  const isWarning = r.similarity_score >= 65 && r.is_active;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/40 transition ${
                        isCritical
                          ? "bg-rose-950/10"
                          : isWarning
                          ? "bg-amber-950/10"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white tracking-wide">
                            {r.title}
                          </span>
                          {r.sign_type && (
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                              {r.sign_type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center justify-center rounded-md bg-blue-500/10 px-2 py-0.5 font-medium text-blue-400 border border-blue-500/20">
                          {r.nice_class || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-300" title={r.owner}>
                        {r.owner || "Sin datos"}
                      </td>
                      <td className="py-3 px-3">
                        {r.is_granted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> Concedida
                          </span>
                        ) : r.is_pending ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" /> En trámite
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/30 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                            {r.status || "Inactivo"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        <div>Sol: {r.file_number || "—"}</div>
                        {r.registration_number && (
                          <div className="text-slate-300">Reg: {r.registration_number}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold text-xs ${
                              r.similarity_score >= 85
                                ? "text-rose-400"
                                : r.similarity_score >= 65
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {r.similarity_score}%
                          </span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[120px]" title={r.similarity_risk}>
                            {r.similarity_score >= 90 ? "Identidad / Fonética" : r.similarity_score >= 70 ? "Alta semejanza" : "Baja similitud"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
