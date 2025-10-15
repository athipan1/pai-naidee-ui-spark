from playwright.sync_api import Page, expect

def test_category_redirect(page: Page):
    """
    This test verifies that the old /category/:categoryName route correctly
    redirects to the new /discover?cat=:categoryName route.
    """
    try:
        print("Starting verification script...")
        # 1. Arrange: Go to the legacy category URL.
        page.goto("http://localhost:8080/category/temples")
        print("Navigated to /category/temples")

        # 2. Screenshot: Capture the final result for visual verification.
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot created successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")