from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for all console events and print them
    page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

    base_url = "http://localhost:8080"

    print(f"Navigating to {base_url}...")
    page.goto(base_url)

    # Wait for the URL to be the one we expect
    expect(page).to_have_url(base_url + "/")

    print(f"Checking for place cards on {page.url}...")

    # Wait for the place cards to be visible on the page.
    try:
        first_card = page.locator(".place-card").first
        expect(first_card).to_be_visible(timeout=60000)
        print("Place cards are visible. Taking screenshot...")
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot saved to jules-scratch/verification/verification.png")
    except Exception as e:
        print(f"Failed to find place cards: {e}")
        # Take a screenshot anyway for debugging
        page.screenshot(path="jules-scratch/verification/debug_screenshot.png")
        print("Debug screenshot saved.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)