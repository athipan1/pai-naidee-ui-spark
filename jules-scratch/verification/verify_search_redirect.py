from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the legacy search URL
    page.goto("http://localhost:8080/search?q=test&category=temple")

    # Wait for the redirect to the discover page
    expect(page).to_have_url("http://localhost:8080/discover?mode=search&q=test&cat=temple", timeout=10000)

    # Wait for the discover page to load
    expect(page.locator("h1:has-text('Search')")).to_be_visible()

    # Take a screenshot of the discover page
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)