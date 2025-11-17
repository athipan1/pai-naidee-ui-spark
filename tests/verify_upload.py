import requests
import json
import os

# --- Configuration ---
BASE_URL = "http://localhost:8000/api"
IMAGE_PATH = "test_image.jpg"
VIDEO_PATH = "test_video.mp4"

# --- Test Data ---
place_data = {
    "placeName": "API Test Attraction",
    "placeNameLocal": "สถานที่ทดสอบ API",
    "province": "Bangkok",
    "category": "Test",
    "description": "This is an attraction created via API test.",
    "coordinates": {"lat": 13.7563, "lng": 100.5018},
}

media_metadata = [
    {"title": "Test Image", "description": "A test image file.", "type": "image"},
    {"title": "Test Video", "description": "A test video file.", "type": "video"},
]

def create_dummy_files():
    """Creates dummy image and video files for testing."""
    with open(IMAGE_PATH, "wb") as f:
        f.write(os.urandom(1024))  # 1KB dummy image
    with open(VIDEO_PATH, "wb") as f:
        f.write(os.urandom(1024 * 1024))  # 1MB dummy video
    print(f"Created dummy files: {IMAGE_PATH}, {VIDEO_PATH}")

def cleanup_dummy_files():
    """Removes the dummy files after the test."""
    if os.path.exists(IMAGE_PATH):
        os.remove(IMAGE_PATH)
    if os.path.exists(VIDEO_PATH):
        os.remove(VIDEO_PATH)
    print(f"Cleaned up dummy files.")

def run_upload_test():
    """Runs the API upload test."""
    print("--- Starting Media Upload API Test ---")
    create_dummy_files()

    files_to_upload = [
        ('files', (IMAGE_PATH, open(IMAGE_PATH, 'rb'), 'image/jpeg')),
        ('files', (VIDEO_PATH, open(VIDEO_PATH, 'rb'), 'video/mp4')),
    ]

    payload = {
        'placeData': json.dumps(place_data),
        'metadata': json.dumps(media_metadata)
    }

    try:
        print(f"Sending POST request to {BASE_URL}/places...")
        response = requests.post(
            f"{BASE_URL}/places",
            files=files_to_upload,
            data=payload
        )

        print(f"Status Code: {response.status_code}")

        # Try to parse JSON, but print raw text if it fails
        try:
            response_data = response.json()
            print("Response JSON:")
            print(json.dumps(response_data, indent=2))
        except json.JSONDecodeError:
            print("Response Text (Not JSON):")
            print(response.text)

        if response.status_code == 201 and response_data.get("success"):
            print("\n✅ TEST PASSED: Successfully created attraction with media.")
            print(f"   Place ID: {response_data.get('placeId')}")
            print(f"   Message: {response_data.get('message')}")
            # Extract and print the public URL of the first image
            if response_data.get("media") and len(response_data["media"]) > 0:
                image_url = response_data["media"][0].get("url")
                if image_url:
                    print(f"\nImage URL: {image_url}")
                else:
                    print("\nCould not find image URL in the response.")
        else:
            print(f"\n❌ TEST FAILED: API returned status {response.status_code}.")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ TEST FAILED: An error occurred during the request: {e}")
    finally:
        # Close the files
        for _, (_, file_obj, _) in files_to_upload:
            file_obj.close()
        cleanup_dummy_files()
        print("\n--- Test Finished ---")

if __name__ == "__main__":
    run_upload_test()
