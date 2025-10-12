from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/temp-ai-assistant")

        # Wait for the page to fully load
        page.wait_for_selector('text="PaiNaiDee AI Assistant"')

        # The AIAssistantPage should now be visible.
        # I'll take a screenshot to verify the initial state.
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()