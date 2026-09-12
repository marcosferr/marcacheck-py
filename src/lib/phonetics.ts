/**
 * Módulo de análisis fonético y gráfico para cotejo de signos distintivos (marcas).
 * Alineado con los criterios de confusión fonética y gráfica del Derecho de Marcas
 * (Ley 1294/98 de Marcas de Paraguay y directrices de la DINAPI / OMPI).
 */

export function normalizeMarkName(name: string): string {
  if (!name) return "";
  // Quitar tildes y diacríticos
  const clean = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean;
}

export function spanishPhoneticCode(name: string): string {
  const text = normalizeMarkName(name);
  if (!text) return "";

  const words = text.split(/\s+/);
  const codedWords: string[] = [];

  for (let w of words) {
    // 1. Reglas de dígrafos previos
    w = w.replace(/PH/g, "F");
    w = w.replace(/CH/g, "X");
    w = w.replace(/SH/g, "X");
    w = w.replace(/LL/g, "Y");
    w = w.replace(/QU([EI])/g, "K$1");
    w = w.replace(/QU([AO])/g, "KU$1");
    w = w.replace(/Q/g, "K");

    // 2. B y V suenan idéntico en español
    w = w.replace(/[BVW]/g, "B");

    // 3. C, S, Z
    // C suave (CE, CI) -> S
    w = w.replace(/C([EIY])/g, "S$1");
    // C dura (CA, CO, CU, consonante) -> K
    w = w.replace(/C/g, "K");
    // Z -> S
    w = w.replace(/Z/g, "S");

    // 4. G y J
    // GE, GI -> J
    w = w.replace(/G([EIY])/g, "J$1");
    // GU ante E, I donde la U es muda (GUE, GUI) -> G
    w = w.replace(/GU([EI])/g, "G$1");

    // 5. H muda
    w = w.replace(/H/g, "");

    // 6. Y final -> I
    w = w.replace(/Y$/g, "I");

    // 7. XC -> S
    w = w.replace(/XC/g, "S");

    // 8. Colapsar consonantes idénticas consecutivas (ej. NN -> N, RR -> R)
    w = w.replace(/([B-DF-HJ-NP-TV-Z])\1+/g, "$1");

    codedWords.push(w);
  }

  return codedWords.join(" ");
}

export function levenshteinDistance(s1: string, s2: string): number {
  if (s1.length < s2.length) {
    return levenshteinDistance(s2, s1);
  }
  if (s2.length === 0) {
    return s1.length;
  }

  let previousRow: number[] = Array.from({ length: s2.length + 1 }, (_, i) => i);
  for (let i = 0; i < s1.length; i++) {
    const currentRow: number[] = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow = currentRow;
  }

  return previousRow[previousRow.length - 1];
}

export function levenshteinSimilarity(s1: string, s2: string): number {
  const n1 = normalizeMarkName(s1);
  const n2 = normalizeMarkName(s2);
  if (!n1 && !n2) return 1.0;
  if (!n1 || !n2) return 0.0;
  const maxLen = Math.max(n1.length, n2.length);
  const dist = levenshteinDistance(n1, n2);
  return Math.round((1.0 - dist / maxLen) * 10000) / 10000;
}

export function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0.0;

  const matchDistance = Math.max(0, Math.floor(Math.max(len1, len2) / 2) - 1);
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  let matches = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) {
      k++;
    }
    if (s1[i] !== s2[k]) {
      transpositions++;
    }
    k++;
  }

  const tr = transpositions / 2;
  return (matches / len1 + matches / len2 + (matches - tr) / matches) / 3.0;
}

export function jaroWinklerSimilarity(s1: string, s2: string, p = 0.1, maxL = 4): number {
  const n1 = normalizeMarkName(s1);
  const n2 = normalizeMarkName(s2);
  const j = jaroSimilarity(n1, n2);
  let l = 0;
  const minLen = Math.min(n1.length, n2.length, maxL);
  for (let i = 0; i < minLen; i++) {
    if (n1[i] === n2[i]) {
      l++;
    } else {
      break;
    }
  }
  return Math.round((j + l * p * (1 - j)) * 10000) / 10000;
}

export function trademarkSimilarityScore(targetName: string, candidateName: string): [number, string] {
  const n1 = normalizeMarkName(targetName);
  const n2 = normalizeMarkName(candidateName);

  if (!n1 || !n2) {
    return [0.0, "Sin datos"];
  }

  // Coincidencia idéntica exacta
  if (n1 === n2) {
    return [100.0, "Identidad absoluta"];
  }

  // Similitud fonética
  const p1 = spanishPhoneticCode(n1);
  const p2 = spanishPhoneticCode(n2);
  const phoneticMatch = p1 === p2 && p1.length > 0;
  const phoneticSim = levenshteinSimilarity(p1, p2);

  // Similitud ortográfica
  const orthoLev = levenshteinSimilarity(n1, n2);
  const orthoJw = jaroWinklerSimilarity(n1, n2);
  const orthoSim = orthoLev * 0.4 + orthoJw * 0.6;

  // Inclusión o contención
  let inclusionBonus = 0.0;
  if (n1.includes(n2) || n2.includes(n1)) {
    inclusionBonus = 0.25;
  }

  let score = 0.0;
  if (phoneticMatch) {
    score = Math.max(85.0, orthoSim * 30.0 + 70.0);
  } else {
    const rawScore = phoneticSim * 0.5 + orthoSim * 0.35 + inclusionBonus * 0.15;
    score = Math.min(99.0, rawScore * 100.0);
  }

  score = Math.round(score * 10) / 10;

  let category = "";
  if (score >= 85) {
    category = "Riesgo de confusión MUY ALTO (Identidad fonética o cuasi-identidad)";
  } else if (score >= 70) {
    category = "Riesgo de confusión ALTO (Gran semejanza gráfica y fonética)";
  } else if (score >= 50) {
    category = "Riesgo de confusión MEDIO (Similitud parcial o término contenido)";
  } else {
    category = "Riesgo de confusión BAJO (Signos suficientemente distintivos)";
  }

  return [score, category];
}
