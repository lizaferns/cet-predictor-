import requests

def test_health():
    try:
        r = requests.get("http://localhost:8000/health")
        print(f"Health check: {r.status_code} - {r.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")

def test_test_endpoint():
    try:
        r = requests.get("http://localhost:8000/api/test")
        print(f"Test endpoint: {r.status_code} - Records loaded: {r.json().get('records_loaded')}")
    except Exception as e:
        print(f"Test endpoint failed: {e}")

if __name__ == "__main__":
    test_health()
    test_test_endpoint()
