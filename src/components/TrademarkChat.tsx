"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, Key, RefreshCw } from "lucide-react";
import { InvestigationReport } from "@/lib/clearance";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface TrademarkChatProps {
  report: InvestigationReport | null;
  openAiKey: string;
  model?: string;
  onOpenSettings: () => void;
}

export default function TrademarkChat({
  report,
  openAiKey,
  model = "gpt-5-mini",
  onOpenSettings,
}: TrademarkChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu **Asesor Especialista en Marcas de Paraguay**. Conozco a detalle la Ley N° 1294/98 'De Marcas', las directrices de la DINAPI y el clasificador de Niza.\n\nPuedes consultarme sobre viabilidad legal, estrategias de registro (denominativa vs mixta), plazos de oposición (Art. 16), o cómo resolver objeciones con antecedentes hallados.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasServerKey, setHasServerKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        if (d?.hasServerOpenAiKey) {
          setHasServerKey(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setErrorMsg(null);
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m.role !== "system"),
          report: report || undefined,
          apiKey: openAiKey || undefined,
          model: model,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Error al procesar la respuesta del asesor.");
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.message },
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el asistente de OpenAI.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        role: "assistant",
        content: report
          ? `He actualizado el contexto con la investigación de **"${report.brand_name}"** (${report.target_class ? `Clase Niza ${report.target_class}` : "General"}). ¿Qué duda legal o estratégica deseas consultar?`
          : "Conversación reiniciada. ¿Qué consulta tienes sobre el registro de marcas en Paraguay?",
      },
    ]);
    setErrorMsg(null);
  };

  const suggestions = report
    ? [
        `¿Qué opinas del riesgo de "${report.brand_name}" según la Ley 1294/98?`,
        "¿Recomiendas registrar como marca denominativa o mixta?",
        "¿Cómo funciona el plazo de 60 días para oposiciones en DINAPI?",
      ]
    : [
        "¿Qué requisitos exige la DINAPI para registrar una marca?",
        "¿Cuál es la diferencia entre marca denominativa, mixta y figurativa?",
        "¿Cómo funciona el principio de especialidad por clases Niza?",
      ];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md">
            <Bot className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Asesor Legal AI</h3>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
                Ley 1294/98
              </span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-500/20">
                {model}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {report ? (
                <span className="text-emerald-400 font-medium">
                  ● Contexto activo: &quot;{report.brand_name}&quot;
                </span>
              ) : (
                "Especialista en Derecho Marcario DINAPI"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={resetConversation}
            title="Reiniciar chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenSettings}
            title={hasServerKey ? "OpenAI API Key configurada en Vercel" : "Configurar OpenAI API Key"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            {hasServerKey ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-300 font-medium">Vercel Env</span>
              </>
            ) : openAiKey ? (
              <>
                <Key className="h-3.5 w-3.5 text-blue-400" />
                <span>Key Local</span>
              </>
            ) : (
              <>
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span>API Key</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                  : "bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>

            {msg.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-800/80 px-4 py-2.5 text-xs text-slate-400 border border-slate-700/60 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              Analizando fundamentos de la Ley 1294/98 y redactando dictamen...
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-rose-200 mb-1">Error al consultar OpenAI</div>
              <p>{errorMsg}</p>
              {errorMsg.toLowerCase().includes("openai_api_key") || errorMsg.toLowerCase().includes("clave") ? (
                <button
                  onClick={onOpenSettings}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 transition"
                >
                  <Key className="h-3 w-3" /> Configurar OpenAI API Key
                </button>
              ) : null}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span className="text-[11px] font-medium text-slate-400">Consultas sugeridas:</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(s)}
              className="shrink-0 text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700/50 hover:border-slate-600 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntale al asesor legal sobre DINAPI, viabilidad, oposiciones..."
            rows={1}
            disabled={loading}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 pl-3.5 pr-12 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 p-1.5 text-white shadow hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
