"use client";

import React, { useState, useEffect } from "react";
import { Key, ShieldCheck, X, Check, Cpu } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  openAiKey: string;
  setOpenAiKey: (key: string) => void;
  openAiModel: string;
  setOpenAiModel: (model: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  openAiKey,
  setOpenAiKey,
  openAiModel,
  setOpenAiModel,
}: SettingsModalProps) {
  const [localKey, setLocalKey] = useState(openAiKey);
  const [localModel, setLocalModel] = useState(openAiModel || "gpt-5-mini");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalKey(openAiKey);
    setLocalModel(openAiModel || "gpt-5-mini");
  }, [openAiKey, openAiModel]);

  if (!isOpen) return null;

  const handleSave = () => {
    setOpenAiKey(localKey.trim());
    setOpenAiModel(localModel.trim());
    if (typeof window !== "undefined") {
      localStorage.setItem("marcacheck_openai_key", localKey.trim());
      localStorage.setItem("marcacheck_openai_model", localModel.trim());
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
            <h3 className="text-lg font-semibold text-white">Configuración de Inteligencia Artificial</h3>
            <p className="text-xs text-slate-400">Personaliza tu clave y modelo de OpenAI</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Modelo de OpenAI
            </label>
            <div className="relative">
              <select
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="gpt-5-mini">GPT-5 Mini (Recomendado / Predeterminado)</option>
                <option value="gpt-5">GPT-5</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="o3-mini">o3-mini</option>
              </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Configurado actualmente: <span className="text-indigo-400 font-mono font-medium">{localModel}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Tu clave se almacena localmente en tu navegador para interactuar con el modelo seleccionado.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-medium text-emerald-400">Tavily & DINAPI activos:</span> El motor oficial de marcas de Paraguay y búsqueda web están listos para inyectar datos en tiempo real al modelo.
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
                "Guardar Cambios"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
