from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    base_url = "http://localhost:8080"

    try:
        print(f"Navigating to {base_url}...")
        page.goto(base_url, timeout=30000)

        print("Waiting for page to load...")
        expect(page).to_have_url(base_url + "/", timeout=15000)

        print(f"Checking for attraction cards on {page.url}...")

        # Wait for the first attraction card to be visible
        first_card = page.locator("article[role='listitem']").first
        expect(first_card).to_be_visible(timeout=30000)

        print("Attraction cards are visible. Taking screenshot...")
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot saved successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        print("Error screenshot saved.")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
