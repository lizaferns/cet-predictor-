import requests

url = "http://localhost:8000/api/predict"
payload = {
    "percentile": 95.0,
    "category": "OPEN",
    "city_filter": "all",
    "course_filter": "all"
}

try:
    response = requests.post(url, json=payload)
    data = response.json()
    print(f"Status Code: {response.status_code}")
    if "results" in data:
        print(f"Results Count: {len(data['results'])}")
        if data['results']:
            print(f"First Result: {data['results'][0]['college_name']}")
    else:
        print(f"Error Message: {data.get('message', 'No results field')}")
except Exception as e:
    print(f"Error: {e}")
