"""
Módulo de análisis fonético y gráfico para cotejo de signos distintivos (marcas).
Alineado con los criterios de confusión fonética y gráfica del Derecho de Marcas
(Ley 1294/98 de Marcas de Paraguay y directrices de la DINAPI / OMPI).
"""

import re
import unicodedata
from typing import Tuple

def normalize_mark_name(name: str) -> str:
    """Limpia y normaliza el texto de una marca (mayúsculas, sin acentos, sin puntuación innecesaria)."""
    if not name:
        return ""
    # Descomponer caracteres Unicode y quitar tildes
    nfkd = unicodedata.normalize('NFKD', name)
    clean = "".join([c for c in nfkd if not unicodedata.combining(c)])
    # Pasar a mayúsculas
    clean = clean.upper().strip()
    # Reemplazar caracteres especiales y puntuación por espacios simples
    clean = re.sub(r'[^A-Z0-9\s]', ' ', clean)
    # Colapsar espacios múltiples y recortar bordes
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def spanish_phonetic_code(name: str) -> str:
    """
    Genera un código fonético para el idioma español latinoamericano (incluyendo uso paraguayo).
    Transforma variantes alófonas comunes:
    - B / V -> B
    - C (ante E, I), Z, S -> S
    - C (ante A, O, U), K, Q -> K
    - G (ante E, I), J -> J
    - CH -> X
    - LL, Y -> Y
    - H muda -> eliminada
    - PH -> F
    - W -> V/U -> B
    - Vocales dobles colapsadas
    """
    text = normalize_mark_name(name)
    if not text:
        return ""

    words = text.split()
    coded_words = []

    for word in words:
        w = word
        # 1. Reglas de dígrafos previos
        w = re.sub(r'PH', 'F', w)
        w = re.sub(r'CH', 'X', w)
        w = re.sub(r'SH', 'X', w)
        w = re.sub(r'LL', 'Y', w)
        w = re.sub(r'QU([EI])', r'K\1', w)
        w = re.sub(r'QU([AO])', r'KU\1', w)
        w = re.sub(r'Q', 'K', w)

        # 2. B y V suenan idéntico en español
        w = re.sub(r'[BVW]', 'B', w)

        # 3. C, S, Z
        # C suave (CE, CI) -> S
        w = re.sub(r'C([EIY])', r'S\1', w)
        # C dura (CA, CO, CU, consonante) -> K
        w = re.sub(r'C', 'K', w)
        # Z -> S
        w = re.sub(r'Z', 'S', w)

        # 4. G y J
        # GE, GI -> J
        w = re.sub(r'G([EIY])', r'J\1', w)
        # GU ante E, I donde la U es muda (GUE, GUI) -> G
        w = re.sub(r'GU([EI])', r'G\1', w)

        # 5. H muda (salvo que sea parte de X/CH ya tratada)
        w = re.sub(r'H', '', w)

        # 6. Y consonante / vocal
        # Y final -> I
        w = re.sub(r'Y$', 'I', w)

        # 7. K y X
        w = re.sub(r'XC', 'S', w)

        # 8. Colapsar consonantes idénticas consecutivas (ej. NN -> N, RR -> R)
        w = re.sub(r'([B-DF-HJ-NP-TV-Z])\1+', r'\1', w)

        coded_words.append(w)

    return " ".join(coded_words)

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calcula la distancia de edición de Levenshtein entre dos cadenas."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

def levenshtein_similarity(s1: str, s2: str) -> float:
    """Calcula el ratio de similitud ortográfica entre 0.0 y 1.0."""
    n1 = normalize_mark_name(s1)
    n2 = normalize_mark_name(s2)
    if not n1 and not n2:
        return 1.0
    if not n1 or not n2:
        return 0.0
    max_len = max(len(n1), len(n2))
    dist = levenshtein_distance(n1, n2)
    return round(1.0 - (dist / max_len), 4)

def jaro_similarity(s1: str, s2: str) -> float:
    """Calcula la similitud de Jaro."""
    if s1 == s2:
        return 1.0
    len1, len2 = len(s1), len(s2)
    if len1 == 0 or len2 == 0:
        return 0.0

    match_distance = max(len1, len2) // 2 - 1
    if match_distance < 0:
        match_distance = 0

    s1_matches = [False] * len1
    s2_matches = [False] * len2
    matches = 0

    for i in range(len1):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len2)
        for j in range(start, end):
            if s2_matches[j]:
                continue
            if s1[i] != s2[j]:
                continue
            s1_matches[i] = True
            s2_matches[j] = True
            matches += 1
            break

    if matches == 0:
        return 0.0

    k = 0
    transpositions = 0
    for i in range(len1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    transpositions /= 2
    return (matches / len1 + matches / len2 + (matches - transpositions) / matches) / 3.0

def jaro_winkler_similarity(s1: str, s2: str, p: float = 0.1, max_l: int = 4) -> float:
    """Calcula la similitud de Jaro-Winkler, con bonificación por prefijos coincidentes."""
    n1 = normalize_mark_name(s1)
    n2 = normalize_mark_name(s2)
    j = jaro_similarity(n1, n2)
    l = 0
    min_len = min(len(n1), len(n2), max_l)
    for i in range(min_len):
        if n1[i] == n2[i]:
            l += 1
        else:
            break
    return round(j + (l * p * (1 - j)), 4)

def trademark_similarity_score(target_name: str, candidate_name: str) -> Tuple[float, str]:
    """
    Evalúa la similitud integral (fonética, gráfica y estructural) entre dos signos.
    Devuelve: (score_porcentaje_0_a_100, descripcion_riesgo)
    """
    n1 = normalize_mark_name(target_name)
    n2 = normalize_mark_name(candidate_name)

    if not n1 or not n2:
        return 0.0, "Sin datos"

    # Coincidencia idéntica exacta
    if n1 == n2:
        return 100.0, "Identidad absoluta"

    # Similitud fonética
    p1 = spanish_phonetic_code(n1)
    p2 = spanish_phonetic_code(n2)
    phonetic_match = (p1 == p2)
    phonetic_sim = levenshtein_similarity(p1, p2)

    # Similitud ortográfica
    ortho_lev = levenshtein_similarity(n1, n2)
    ortho_jw = jaro_winkler_similarity(n1, n2)
    ortho_sim = (ortho_lev * 0.4) + (ortho_jw * 0.6)

    # Inclusión o contención (ej. 'GUARANA' dentro de 'FANTA GUARANA')
    inclusion_bonus = 0.0
    if n1 in n2 or n2 in n1:
        inclusion_bonus = 0.25

    # Ponderación final:
    # Si la fonética es idéntica -> mínimo 85% de similitud
    if phonetic_match:
        score = max(85.0, (ortho_sim * 30.0) + 70.0)
    else:
        raw_score = (phonetic_sim * 0.50) + (ortho_sim * 0.35) + (inclusion_bonus * 0.15)
        score = min(99.0, raw_score * 100.0)

    score = round(score, 1)

    if score >= 85:
        category = "Riesgo de confusión MUY ALTO (Identidad fonética o cuasi-identidad)"
    elif score >= 70:
        category = "Riesgo de confusión ALTO (Gran semejanza gráfica y fonética)"
    elif score >= 50:
        category = "Riesgo de confusión MEDIO (Similitud parcial o término contenido)"
    else:
        category = "Riesgo de confusión BAJO (Signos suficientemente distintivos)"

    return score, category
