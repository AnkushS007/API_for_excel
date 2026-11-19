import requests

BASE_URL = "https://www.airlinemanager.com/api"

class AM4APIError(RuntimeError):
    pass

class AM4Client:
    def __init__(self, api_key, timeout=25):
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "AM4-Rapid-Growth-Assistant/0.1 (read-only)"})

    def _get(self, params):
        query = {"access_token": self.api_key, **params}
        response = self.session.get(BASE_URL, params=query, timeout=self.timeout)
        response.raise_for_status()
        try:
            data = response.json()
        except ValueError as exc:
            raise AM4APIError("AM4 API returned a non-JSON response.") from exc
        status = data.get("status", {})
        if status.get("request") != "success":
            # Do not include request URL: it contains the private access token.
            raise AM4APIError(f"AM4 API rejected the request: {status}")
        return data

    def profile(self, company):
        return self._get({"user": company})

    def demand(self, departure_icao, arrival_icao):
        return self._get({"fields": "demand", "dep_icao": departure_icao, "arr_icao": arrival_icao})

    def research(self, departure_icao, min_runway, max_distance):
        return self._get({"fields": "research", "dep_icao": departure_icao,
                          "min_runway": min_runway, "max_distance": max_distance})
