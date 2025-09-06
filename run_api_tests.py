import requests
import json
from tabulate import tabulate
import time

# Set the deployed API URL
API_BASE_URL = "https://athipan01-painaidee-backend.hf.space"

def call_api(method, endpoint, payload=None, headers=None):
    """
    Helper function to call API endpoints
    """
    url = f"{API_BASE_URL}{endpoint}"

    # Default headers
    default_headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    if headers:
        default_headers.update(headers)

    try:
        print(f"🔄 {method} {url}")

        if method.upper() == 'GET':
            response = requests.get(url, headers=default_headers, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, json=payload, headers=default_headers, timeout=30)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=payload, headers=default_headers, timeout=30)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=default_headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")

        print(f"✅ Status: {response.status_code}")

        # Try to parse JSON, fall back to text if it fails
        try:
            data = response.json()
        except json.JSONDecodeError:
            data = response.text

        return {
            'success': response.ok,
            'status_code': response.status_code,
            'data': data,
            'error': response.text if not response.ok else None
        }

    except requests.RequestException as e:
        print(f"❌ Error: {str(e)}")
        return {
            'success': False,
            'status_code': 'N/A',
            'error': str(e),
            'data': None
        }

def main():
    """Main function to run all API tests."""
    results = []

    print("--- Starting Public Endpoint Tests ---")

    # 1. Health Check
    res = call_api("GET", "/api/health")
    status = "✅" if res['success'] else "❌"
    note = "OK" if res['success'] else res['error']
    results.append(["GET", "/api/health", status, res['status_code'], note])

    # 2. Search
    search_payload = {"query": "Bangkok"}
    res = call_api("POST", "/api/search", payload=search_payload)
    status = "✅" if res['success'] else "❌"
    note = "OK" if res['success'] else res['error']
    results.append(["POST", "/api/search", status, res['status_code'], note])

    # 3. Locations Autocomplete
    res = call_api("GET", "/api/locations/autocomplete?query=chiang")
    status = "✅" if res['success'] else "❌"
    note = "OK" if res['success'] else res['error']
    results.append(["GET", "/api/locations/autocomplete", status, res['status_code'], note])

    # 4. Get Posts
    res = call_api("GET", "/api/posts")
    status = "✅" if res['success'] else "❌"
    note = "OK" if res['success'] else res['error']
    results.append(["GET", "/api/posts", status, res['status_code'], note])

    # 5. Get Explore Videos
    res = call_api("GET", "/api/explore/videos")
    status = "✅" if res['success'] else "❌"
    note = "OK" if res['success'] else res['error']
    results.append(["GET", "/api/explore/videos", status, res['status_code'], note])

    # 6. Get Attractions
    res = call_api("GET", "/api/attractions")
    status = "✅" if res['success'] else "❌"
    note = "OK" if res['success'] else res['error']
    results.append(["GET", "/api/attractions", status, res['status_code'], note])


    print("\n--- Test Results (Public) ---")
    headers = ["Method", "Path", "Status", "Response Code", "Note"]
    print(tabulate(results, headers=headers, tablefmt="pipe"))

    print("\n--- Test Results (Public) ---")
    headers = ["Method", "Path", "Status", "Response Code", "Note"]
    print(tabulate(results, headers=headers, tablefmt="pipe"))

    print("\n--- Starting Authenticated Endpoint Tests ---")

    # 1. Register new user
    registration_payload = {
        "username": "testuser01",
        "password": "Test@1234",
        "email": "testuser01@example.com"
    }
    res = call_api("POST", "/api/auth/register", payload=registration_payload)
    status = "✅" if res['success'] else "⚠️" # Warning because user might already exist
    note = "OK" if res['success'] else res['error']
    if res['status_code'] == 400 and 'already exists' in str(res['error']):
        status = "✅"
        note = "User already exists, proceeding with login."
    results.append(["POST", "/api/auth/register", status, res['status_code'], note])

    # 2. Login to get token
    auth_token = None
    login_payload = {"username": "testuser01", "password": "Test@1234"}
    res = call_api("POST", "/api/auth/login", payload=login_payload)
    status = "✅" if res['success'] else "❌"
    note = "OK" if res['success'] else res['error']
    if res['success'] and isinstance(res.get('data'), dict) and res['data'].get('data', {}).get('token', {}).get('access_token'):
        auth_token = res['data']['data']['token']['access_token']
        note = "Login successful, token received."
    else:
        note = f"Login failed or token not found in response. Response: {res.get('data')}"
    results.append(["POST", "/api/auth/login", status, res['status_code'], note])

    if auth_token:
        auth_headers = {"Authorization": f"Bearer {auth_token}"}

        # Test all protected endpoints
        # Create Post
        post_payload = {"content": "This is a test post from the API test script.", "title": "Test Post"}
        res = call_api("POST", "/api/posts", payload=post_payload, headers=auth_headers)
        status = "✅" if res['success'] else "❌"
        note = "OK" if res['success'] else res.get('error', 'N/A')
        post_id = res['data'].get('id') if res['success'] and isinstance(res['data'], dict) else None
        results.append(["POST", "/api/posts", status, res.get('status_code', 'N/A'), note])

        if post_id:
            # Like Post
            res = call_api("POST", f"/api/posts/{post_id}/like", headers=auth_headers)
            status = "✅" if res['success'] else "❌"
            results.append(["POST", "/api/posts/{postId}/like", status, res.get('status_code', 'N/A'), res.get('error', 'OK')])

            # Get Post Engagement
            res = call_api("GET", f"/api/posts/{post_id}/engagement", headers=auth_headers)
            status = "✅" if res['success'] else "❌"
            results.append(["GET", "/api/posts/{postId}/engagement", status, res.get('status_code', 'N/A'), res.get('error', 'OK')])

            # Add Comment to Post
            comment_payload = {"text": "This is a test comment."}
            res = call_api("POST", f"/api/posts/{post_id}/comments", payload=comment_payload, headers=auth_headers)
            status = "✅" if res['success'] else "❌"
            results.append(["POST", "/api/posts/{postId}/comments", status, res.get('status_code', 'N/A'), res.get('error', 'OK')])

        # Create Attraction (Example)
        attraction_payload = {"name": "Test Attraction", "description": "A test attraction.", "latitude": 13.75, "longitude": 100.5}
        res = call_api("POST", "/api/attractions", payload=attraction_payload, headers=auth_headers)
        status = "✅" if res['success'] else "❌"
        results.append(["POST", "/api/attractions", status, res.get('status_code', 'N/A'), res.get('error', 'OK')])

        # Assume a videoId and userId for testing like/follow
        video_id_for_test = "some_video_id"
        user_id_for_test = "some_user_id"
        attraction_id_for_test = "some_attraction_id"

        # Like Video
        res = call_api("POST", f"/api/videos/{video_id_for_test}/like", headers=auth_headers)
        status = "⚠️" # Mark as warning as we don't know if the ID is valid
        note = "Test with a placeholder ID. The endpoint might be working, but the ID is likely invalid."
        results.append(["POST", "/api/videos/{videoId}/like", status, res.get('status_code', 'N/A'), note])

        # Follow User
        res = call_api("POST", f"/api/users/{user_id_for_test}/follow", headers=auth_headers)
        status = "⚠️"
        note = "Test with a placeholder ID. The endpoint might be working, but the ID is likely invalid."
        results.append(["POST", "/api/users/{userId}/follow", status, res.get('status_code', 'N/A'), note])

        # Get nearby accommodations
        res = call_api("GET", f"/api/accommodations/nearby/{attraction_id_for_test}", headers=auth_headers)
        status = "⚠️"
        note = "Test with a placeholder ID. The endpoint might be working, but the ID is likely invalid."
        results.append(["GET", "/api/accommodations/nearby/{attractionId}", status, res.get('status_code', 'N/A'), note])

    else:
        print("⚠️ Skipping authenticated tests: Login failed.")

    print("\n--- Final Test Results ---")
    print(tabulate(results, headers=headers, tablefmt="pipe"))


if __name__ == "__main__":
    print(f"🌐 Testing API at: {API_BASE_URL}")
    main()
