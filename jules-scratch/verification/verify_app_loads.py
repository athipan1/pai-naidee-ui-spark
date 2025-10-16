from playwright.sync_api import Page, expect, sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to the page...")
            # 1. Arrange: Go to the application's home page.
            page.goto("http://localhost:8080", timeout=60000)
            print("Page loaded.")

            # 2. Assert: Confirm the main heading is visible.
            # This confirms the page has loaded before we take the screenshot.
            print("Looking for heading...")
            expect(page.get_by_role("heading", name="ค้นพบสถานที่ท่องเที่ยวที่น่าทึ่งในประเทศไทย")).to_be_visible()
            print("Heading found.")

            # 3. Screenshot: Capture the final result for visual verification.
            page.screenshot(path="jules-scratch/verification/verification.png")
            print("Screenshot taken successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_test()