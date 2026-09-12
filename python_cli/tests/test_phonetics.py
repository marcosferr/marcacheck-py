import unittest
from dinapi.phonetics import (
    normalize_mark_name,
    spanish_phonetic_code,
    levenshtein_distance,
    levenshtein_similarity,
    trademark_similarity_score
)

class TestPhonetics(unittest.TestCase):

    def test_normalize_mark_name(self):
        self.assertEqual(normalize_mark_name("Guaraná & Tereré!"), "GUARANA TERERE")
        self.assertEqual(normalize_mark_name("  coca-cola   light  "), "COCA COLA LIGHT")
        self.assertEqual(normalize_mark_name(""), "")

    def test_spanish_phonetic_code(self):
        # B y V deben sonar igual
        code_b = spanish_phonetic_code("BITA")
        code_v = spanish_phonetic_code("VITA")
        self.assertEqual(code_b, code_v)

        # PH y F
        code_ph = spanish_phonetic_code("PHARMA")
        code_f = spanish_phonetic_code("FARMA")
        self.assertEqual(code_ph, code_f)

        # K y C dura
        code_k = spanish_phonetic_code("KOLOR")
        code_c = spanish_phonetic_code("COLOR")
        self.assertEqual(code_k, code_c)

        # C suave y S / Z
        code_ce = spanish_phonetic_code("CENA")
        code_se = spanish_phonetic_code("SENA")
        self.assertEqual(code_ce, code_se)

    def test_levenshtein_similarity(self):
        self.assertEqual(levenshtein_similarity("COCA", "COCA"), 1.0)
        sim = levenshtein_similarity("GUARANA", "GUARANI")
        self.assertGreater(sim, 0.8)

    def test_trademark_similarity_score(self):
        # Marcas idénticas
        score, risk = trademark_similarity_score("COCA COLA", "COCA COLA")
        self.assertEqual(score, 100.0)

        # Marcas con identidad fonética
        score_fon, risk_fon = trademark_similarity_score("FARMA", "PHARMA")
        self.assertGreaterEqual(score_fon, 85.0)

        # Marcas totalmente distintas
        score_diff, risk_diff = trademark_similarity_score("MICROSOFT", "YERBA MATE")
        self.assertLess(score_diff, 40.0)

if __name__ == "__main__":
    unittest.main()
