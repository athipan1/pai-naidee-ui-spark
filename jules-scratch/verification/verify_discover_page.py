import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_discover_page(page: Page):
    """
    This script verifies that the discover page loads attractions,
    allows filtering by category, and displays the results correctly.
    """
    # 1. Navigate to the discover page
    print("Navigating to http://localhost:8080/discover...")
    page.goto("http://localhost:8080/discover", timeout=60000)

    # 2. Wait for the initial set of place cards to be visible
    print("Waiting for initial place cards to load...")
    first_card_locator = page.locator('.grid > div[class*="bg-white"]').first
    expect(first_card_locator).to_be_visible(timeout=30000)
    print("Initial place cards loaded.")

    # Take a screenshot of the initial load
    page.screenshot(path="jules-scratch/verification/01_initial_load.png")
    print("Screenshot 1: Initial load captured.")

    # 3. Find and click the "Beach" category button
    print("Looking for 'Beach' category button...")
    beach_button = page.get_by_role("button", name=re.compile("Beach", re.IGNORECASE))
    expect(beach_button).to_be_visible(timeout=15000)

    # Wait a bit for the button to be ready for click
    page.wait_for_timeout(500)
    beach_button.click()
    print("Clicked on 'Beach' category.")

    # 4. Wait for the list to update.
    # A robust way to check for updates is to wait for a known UI element within the cards
    # that indicates new data has been rendered. We'll check for the province text next to the MapPin icon.
    print("Waiting for beach results to load...")
    # Find the first card again after filtering
    updated_first_card = page.locator('.grid > div[class*="bg-white"]').first
    # Check that it contains a province name, which is a good sign it's a valid card
    province_locator = updated_first_card.locator('div:has(> svg[class*="lucide-map-pin"]) > span')
    expect(province_locator).not_to_be_empty(timeout=15000)
    print("Beach results loaded and verified.")

    # 5. Take the final screenshot
    page.screenshot(path="jules-scratch/verification/02_beach_filter.png")
    print("Screenshot 2: Beach filter captured.")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_discover_page(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred during verification: {e}")
        finally:
            browser.close()