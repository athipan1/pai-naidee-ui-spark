from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the discover page
        page.goto("http://localhost:8080/discover")

        # 2. Wait for the "Recommended Places" section header to be present
        recommended_section_header = page.get_by_text("Recommended Places", exact=True)
        expect(recommended_section_header).to_be_visible(timeout=20000)

        # 3. Scroll the header into view
        recommended_section_header.scroll_into_view_if_needed()

        # 4. Wait for at least one place card to be rendered
        first_card = page.locator(".group.cursor-pointer").first
        expect(first_card).to_be_visible()

        # 5. Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        # 6. Clean up
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)