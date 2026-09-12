import unittest
from web_intelligence.tavily_client import TavilyBrandResearcher, WebSearchResult

class TestTavilyResearcher(unittest.TestCase):

    def test_has_valid_key(self):
        r1 = TavilyBrandResearcher(api_key="tvly-test-123456")
        self.assertTrue(r1.has_valid_key())

        r2 = TavilyBrandResearcher(api_key="")
        self.assertFalse(r2.has_valid_key())

    def test_fallback_report_when_no_key(self):
        researcher = TavilyBrandResearcher(api_key="")
        report = researcher.research_brand("MATE PARAGUAYO", category_hint="Yerba mate")
        self.assertFalse(report.has_live_api)
        self.assertEqual(report.brand_name, "MATE PARAGUAYO")
        self.assertIn("TAVILY_API_KEY", report.summary)
        self.assertGreater(len(report.suggested_niza_classes), 0)

    def test_analyze_commercial_presence(self):
        researcher = TavilyBrandResearcher(api_key="")
        sample_results = [
            WebSearchResult(
                title="Yerba Mate Selecta Paraguay",
                url="https://www.selecta.com.py/productos",
                content="Venta de yerba mate y productos en Asunción Paraguay.",
                domain="www.selecta.com.py"
            ),
            WebSearchResult(
                title="Selecta en Instagram",
                url="https://www.instagram.com/selectapy",
                content="Perfil oficial de Selecta.",
                domain="www.instagram.com"
            )
        ]
        analysis = researcher._analyze_commercial_presence(sample_results)
        self.assertTrue(analysis["py_detected"])
        self.assertEqual(len(analysis["social_profiles"]), 1)
        self.assertEqual(analysis["social_profiles"][0]["platform"], "Instagram")

if __name__ == "__main__":
    unittest.main()
