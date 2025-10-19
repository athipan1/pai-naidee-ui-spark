
import os
import requests
from supabase import create_client, Client
from duckduckgo_images_api import search

# --- Configuration ---
SUPABASE_URL = "https://quptneebcplnmzkyuxlu.supabase.co/"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cHRuZWViY3Bsbm16a3l1eGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzgyNjksImV4cCI6MjA3MTUxNDI2OX0.DU4-vgGZFl2xJS2o6EvA5rPOA0YJlwOUJ5JTzrM58yA"
TARGET_PLACES = ["ภูเก็ต", "เชียงใหม่", "พัทยา", "กรุงเทพ", "หัวหิน"]
FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x250?text=No+Image"
TABLE_NAME = "places"

def is_url_accessible(url):
    """Checks if a URL is accessible and returns a 200 OK status."""
    try:
        response = requests.head(url, timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False

def get_place_image_url(place_name):
    """Searches for an image URL for a given place name."""
    print(f"Searching for an image for '{place_name}'...")
    try:
        search_results = search(
            keywords=f"{place_name} travel destination",
            max_results=5
        )

        # Defensive check to ensure search_results is a list of dicts
        if isinstance(search_results, dict) and 'results' in search_results and isinstance(search_results['results'], list):
            for result in search_results['results']:
                if isinstance(result, dict) and 'image' in result:
                    image_url = result['image']
                    if image_url.lower().endswith(('.jpg', '.jpeg', '.png')):
                        if is_url_accessible(image_url):
                            print(f"  -> Found accessible image: {image_url}")
                            return image_url

            print("  -> No accessible JPG/JPEG/PNG image found in results.")
            return FALLBACK_IMAGE_URL
        else:
            print(f"  -> Unexpected format from image search API: {type(search_results)}")
            return FALLBACK_IMAGE_URL

    except Exception as e:
        print(f"  -> An error occurred during image search: {e}")
        return FALLBACK_IMAGE_URL

def main():
    """Main function to fetch images and save URLs to Supabase."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("Successfully connected to Supabase.")
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        return

    saved_urls = []
    successful_fetches = 0

    for place in TARGET_PLACES:
        try:
            # 1. Check if the place already exists
            existing_data, count = supabase.table(TABLE_NAME).select('name').eq('name', place).execute()

            if existing_data and len(existing_data[1]) > 0:
                print(f"  -> '{place}' already exists in Supabase. Skipping insert.")
                # Optional: You could fetch the existing URL to display in the summary
                existing_url_data, count = supabase.table(TABLE_NAME).select('image_url').eq('name', place).single().execute()
                if existing_url_data and len(existing_url_data[1]) > 0:
                     saved_urls.append({'place': place, 'url': existing_url_data[1]['image_url']})
                continue # Skip to the next place

            # 2. If it doesn't exist, fetch the image and insert it
            image_url = get_place_image_url(place)

            data, count = supabase.table(TABLE_NAME).insert({
                'name': place,
                'image_url': image_url
            }).execute()

            print(f"  -> Successfully inserted into Supabase for '{place}'.")
            saved_urls.append({'place': place, 'url': image_url})
            if image_url != FALLBACK_IMAGE_URL:
                successful_fetches += 1

        except Exception as e:
            print(f"  -> An error occurred while processing '{place}': {e}")

    # --- Summary ---
    print("\n--- SCRIPT SUMMARY ---")
    print(f"Total places processed: {len(TARGET_PLACES)}")
    print(f"Successful new image fetches (excluding fallbacks): {successful_fetches}")
    print("\nFinal data in Supabase (or skipped):")
    for item in saved_urls:
        print(f"- {item['place']}: {item['url']}")
    print("----------------------\n")

if __name__ == "__main__":
    main()
