import unittest
from data.niza import NIZA_CLASSES, get_niza_class, search_niza_classes

class TestNiza(unittest.TestCase):

    def test_all_classes_present(self):
        self.assertEqual(len(NIZA_CLASSES), 45)
        for i in range(1, 46):
            self.assertIn(i, NIZA_CLASSES)

    def test_products_and_services_split(self):
        for i in range(1, 35):
            self.assertEqual(NIZA_CLASSES[i].category, "Productos")
        for i in range(35, 46):
            self.assertEqual(NIZA_CLASSES[i].category, "Servicios")

    def test_search_niza(self):
        # Búsqueda por palabra clave "cerveza" debe devolver Clase 32
        results_beer = search_niza_classes("cerveza")
        self.assertTrue(any(c.number == 32 for c in results_beer))

        # Búsqueda por palabra clave "software" debe devolver Clase 9 o 42
        results_soft = search_niza_classes("desarrollo de software saas")
        matched_numbers = [c.number for c in results_soft]
        self.assertTrue(9 in matched_numbers or 42 in matched_numbers)

if __name__ == "__main__":
    unittest.main()
