import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # ไปที่หน้าหลัก ซึ่งควรจะ redirect ไปที่ /discover
    page.goto("http://localhost:8080/")

    # รอให้การ์ดสถานที่ท่องเที่ยวแรกปรากฏขึ้น
    first_card = page.locator(".attraction-card").first
    expect(first_card).to_be_visible(timeout=30000)

    # รอเพิ่มเติมเพื่อให้แน่ใจว่า render เสร็จสมบูรณ์
    page.wait_for_timeout(3000) # เพิ่มเวลารอเป็น 3 วินาที

    # จับภาพหน้าจอ
    page.screenshot(path="jules-scratch/verification/final_verification.png")

    print("✅ Screenshot captured successfully.")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)