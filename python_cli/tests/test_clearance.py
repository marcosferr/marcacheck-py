import unittest
from dinapi.client import DINAPIRecord
from web_intelligence.tavily_client import BrandWebReport, WebSearchResult
from clearance.engine import BrandClearanceEngine

class TestClearanceEngine(unittest.TestCase):

    def setUp(self):
        self.engine = BrandClearanceEngine()

    def test_evaluate_risk_critical_when_identical_granted(self):
        # Caso de marca idéntica concedida en la misma clase
        identical_record = DINAPIRecord(
            file_number="12345",
            registration_number="99999",
            title="INNOVA",
            nice_class="9",
            owner="Empresa X S.A.",
            status="Concedida",
            application_date="2020-01-01",
            registration_date="2021-01-01",
            expiration_date="2031-01-01",
            sign_type="Denominativa",
            procedure_type="REG",
            agent="Agente Y",
            similarity_score=100.0,
            similarity_risk="Identidad absoluta"
        )
        web_report = BrandWebReport(
            brand_name="INNOVA",
            query_used="test",
            has_live_api=False,
            total_results=0
        )

        verdict = self.engine._evaluate_risk(
            brand_name="INNOVA",
            target_class=9,
            dinapi_records=[identical_record],
            related_records=[],
            web_report=web_report
        )

        self.assertEqual(verdict.risk_level, "CRÍTICO")
        self.assertGreaterEqual(verdict.risk_score, 85)
        self.assertLessEqual(verdict.viability_score, 15)
        self.assertEqual(len(verdict.blocking_records), 1)

    def test_evaluate_risk_low_when_no_records(self):
        # Caso de marca libre sin antecedentes
        web_report = BrandWebReport(
            brand_name="SUPERBRANDXYZ99",
            query_used="test",
            has_live_api=False,
            total_results=0
        )

        verdict = self.engine._evaluate_risk(
            brand_name="SUPERBRANDXYZ99",
            target_class=32,
            dinapi_records=[],
            related_records=[],
            web_report=web_report
        )

        self.assertEqual(verdict.risk_level, "BAJO")
        self.assertLessEqual(verdict.risk_score, 20)
        self.assertGreaterEqual(verdict.viability_score, 80)
        self.assertEqual(len(verdict.blocking_records), 0)

if __name__ == "__main__":
    unittest.main()
