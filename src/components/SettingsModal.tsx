"use client";

import React, { useState, useEffect } from "react";
import { Key, ShieldCheck, X, Check } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  openAiKey: string;
  setOpenAiKey: (key: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  openAiKey,
  setOpenAiKey,
}: SettingsModalProps) {
  const [localKey, setLocalKey] = useState(openAiKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalKey(openAiKey);
  }, [openAiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    setOpenAiKey(localKey.trim());
    if (typeof window !== "undefined") {
      localStorage.setItem("marcacheck_openai_key", localKey.trim());
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Configuración de API</h3>
            <p className="text-xs text-slate-400">Personaliza tus claves para el Asesor Legal</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              OpenAI API Key (para el Chat Asesor Legal)
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Tu clave se almacena localmente en tu navegador y se envía directamente a la API de OpenAI para responder tus consultas legales. Si ya está definida en el servidor (.env), puedes dejar este campo vacío.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-medium text-emerald-400">Tavily & DINAPI activos:</span> La búsqueda web y el motor de marcas oficial de Paraguay están conectados y configurados en el backend.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Guardado
                </>
              ) : (
                "Guardar Clave"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
