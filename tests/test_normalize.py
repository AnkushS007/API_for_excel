import unittest
from am4desk.normalize import normalize_profile

class NormalizeTests(unittest.TestCase):
    def test_profile_rows(self):
        payload = {
            "fleet": [{"aircraft": "A320-200", "amount": 2}],
            "routes": [{"dep": "Delhi, India", "stop": None, "arrival": "Dubai, UAE", "distance": 2200, "arrived": 123}]
        }
        fleet, routes = normalize_profile(payload)
        self.assertEqual(fleet, [{"aircraft": "A320-200", "amount": 2}])
        self.assertEqual(routes[0]["stop"], "")
        self.assertEqual(routes[0]["distance"], 2200)

if __name__ == "__main__":
    unittest.main()
