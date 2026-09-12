"use client";

import React from "react";
import { NIZA_CLASSES } from "@/lib/niza";

interface NizaSelectorProps {
  selectedClass?: number;
  onSelectClass: (classNumber?: number) => void;
}

export default function NizaSelector({
  selectedClass,
  onSelectClass,
}: NizaSelectorProps) {
  const classesList = Object.values(NIZA_CLASSES);
  const goods = classesList.filter((c) => c.category === "Productos");
  const services = classesList.filter((c) => c.category === "Servicios");

  return (
    <select
      value={selectedClass || ""}
      onChange={(e) => {
        const val = e.target.value;
        onSelectClass(val ? parseInt(val, 10) : undefined);
      }}
      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
    >
      <option value="">Todas las clases (Búsqueda General DINAPI)</option>
      <optgroup label="── SERVICIOS (Clases 35 a 45) ──">
        {services.map((c) => (
          <option key={c.number} value={c.number}>
            Clase {c.number}: {c.title}
          </option>
        ))}
      </optgroup>
      <optgroup label="── PRODUCTOS (Clases 1 a 34) ──">
        {goods.map((c) => (
          <option key={c.number} value={c.number}>
            Clase {c.number}: {c.title}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
