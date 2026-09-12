import unittest
from dinapi.client import DINAPIClient, DINAPIRecord

class TestDINAPI(unittest.TestCase):

    def setUp(self):
        self.client = DINAPIClient()

    def test_build_payload(self):
        payload = self.client._build_payload(
            name_contains="GUARANA",
            nice_class=32,
            owner_name="COCA"
        )
        self.assertIn("arg0", payload)
        self.assertEqual(payload["arg0"]["criteriaSignData"]["markNameContainsWords"], "GUARANA")
        self.assertEqual(payload["arg0"]["criteriaProtectionData"]["criteriaNiceClassList"]["niceClassNbr"]["doubleValue"], "32")
        self.assertEqual(payload["arg0"]["criteriaOwnershipData"]["ownerNameContainsWords"], "COCA")

    def test_parse_records(self):
        sample_response = [
            {"total": 1, "criterios": ""},
            {
                "fileNbr": "1433103",
                "fecha": "01/08/2014",
                "vence": "29/01/2030",
                "titulo": "BEATS",
                "clase": "38",
                "titular": "Beats Electronics, Llc. [US]",
                "estado": "Concedida",
                "regNbr": 500000.0,
                "regDate": "29/01/2020",
                "typ": "REG",
                "signo": "Denominativa"
            }
        ]

        records = self.client._parse_records(sample_response, reference_term="BEATS")
        self.assertEqual(len(records), 1)
        r = records[0]
        self.assertEqual(r.title, "BEATS")
        self.assertEqual(r.registration_number, "500000")
        self.assertEqual(r.file_number, "1433103")
        self.assertTrue(r.is_granted)
        self.assertTrue(r.is_active)
        self.assertEqual(r.similarity_score, 100.0)

if __name__ == "__main__":
    unittest.main()
