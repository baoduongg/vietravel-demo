"""Lấy danh sách tour thật từ travel.com.vn và ghi vào src/data/tours.json.

Chạy lại trước buổi demo để cập nhật giá và ngày khởi hành:
    python3 scripts/scrape-tours.py
"""

import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

BASE_URL = "https://travel.com.vn/"
OUTPUT = Path(__file__).resolve().parent.parent / "src" / "data" / "tours.json"
LAST_MINUTE_PAGE = "du-lich-gio-chot.aspx"
PAGES = [
    LAST_MINUTE_PAGE,
    "du-lich-ha-noi.aspx",
    "du-lich-da-nang.aspx",
    "du-lich-hue.aspx",
    "du-lich-nha-trang.aspx",
    "du-lich-phu-quoc.aspx",
    "du-lich-mien-tay.aspx",
    "du-lich-con-dao.aspx",
    "du-lich-tieu-chuan.aspx",
    "du-lich-tiet-kiem.aspx",
    "du-lich-cao-cap.aspx",
    "du-lich-nuoc-ngoai.aspx",
    "du-lich-thai-lan.aspx",
    "du-lich-singapore.aspx",
    "du-lich-trung-quoc.aspx",
    "du-lich-dai-loan.aspx",
    "du-lich-han-quoc.aspx",
    "du-lich-nhat-ban.aspx",
    "du-lich-chau-au.aspx",
    "du-lich-uc.aspx",
]
MAX_DEPARTURE_DATES = 4
EMPTY_PAGE_RETRIES = 2
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿]")
DURATION = re.compile(r"(\d+)N(\d+)Đ")


def fetch_html(page: str, attempts: int = 3) -> str:
    request = urllib.request.Request(BASE_URL + page, headers={"User-Agent": "Mozilla/5.0 Chrome/130"})
    for attempt in range(attempts):
        try:
            return urllib.request.urlopen(request, timeout=60).read().decode("utf-8")
        except OSError:
            if attempt == attempts - 1:
                raise
    return ""


def fetch_flight_data(page: str) -> str:
    html = fetch_html(page)
    text = ""
    for chunk in re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html, re.S):
        try:
            text += json.loads(f'"{chunk}"')
        except json.JSONDecodeError:
            continue
    return text


def extract_tours(text: str) -> list[dict]:
    tours = []
    for match in re.finditer(r'\{"tourId":"', text):
        depth = 0
        for end in range(match.start(), len(text)):
            if text[end] == "{":
                depth += 1
            elif text[end] == "}":
                depth -= 1
                if depth == 0:
                    try:
                        tours.append(json.loads(text[match.start() : end + 1]))
                    except json.JSONDecodeError:
                        pass
                    break
    return tours


def clean_title(raw: str) -> tuple[str, str]:
    title = EMOJI.sub("", raw)
    title = re.sub(r"^\s*(\*+|siêu\s*sale\s*)", "", title, flags=re.I)
    title = re.sub(r"\s+", " ", title.replace("–", "-").replace("“", "").replace("”", "").replace("||", " | "))
    parts = [part.strip() for part in title.strip(" -|").split("|") if part.strip()]
    return parts[0], " | ".join(parts[1:])


def duration(text: str | None) -> tuple[int, int]:
    match = DURATION.match(text or "")
    return (int(match[1]), int(match[2])) if match else (1, 0)


def to_tour(raw: dict, deal: dict | None) -> dict:
    code = raw.get("pageCode") or raw["tourCode"].split("-")[0]
    name, highlight = clean_title(raw.get("pageTitle") or raw.get("destination") or "")
    days, nights = duration(raw.get("dayStayText") or raw.get("durationTime"))
    dates = {item["date"][:10] for item in raw.get("listDepartureDate") or []}
    dates.add(raw["departureDate"][:10])
    url = raw.get("linkShare") or f"{BASE_URL}chuong-trinh/{raw['tourUrl']}-pid-{raw['pageId']}"
    tour = {
        "code": code,
        "name": name,
        "highlight": highlight,
        "region": raw["tourName"].strip(),
        "scope": "domestic" if code.startswith("ND") else "international",
        "departureCity": raw["departureName"],
        "departureDates": sorted(dates)[:MAX_DEPARTURE_DATES],
        "days": days,
        "nights": nights,
        "priceVnd": raw.get("priceFinal") or raw.get("discountPrice") or raw.get("salePrice"),
        "tourLine": raw.get("tourLineName") or "",
        "transport": raw.get("transportName") or "",
        "rating": raw.get("rating"),
        "imageUrl": raw.get("imgUrl") or raw.get("imageUrl"),
        "url": url,
    }
    if deal:
        tour["deal"] = {
            "title": deal.get("discountTitle") or "Ưu đãi giờ chót",
            "originalPriceVnd": deal["salePrice"],
            "priceVnd": deal["discountPrice"],
            "departureDate": deal["departureDate"][:10],
        }
    return tour


def main() -> None:
    regular: dict[str, dict] = {}
    last_minute: dict[str, dict] = {}
    for page in PAGES:
        found = extract_tours(fetch_flight_data(page))
        for _ in range(EMPTY_PAGE_RETRIES):
            if found:
                break
            found = extract_tours(fetch_flight_data(page))
        print(f"{page}: {len(found)} tour", file=sys.stderr)
        for raw in found:
            code = raw.get("pageCode") or raw["tourCode"].split("-")[0]
            if code.startswith("FM"):
                continue
            target = last_minute if page == LAST_MINUTE_PAGE else regular
            target.setdefault(code, raw)

    tours = [to_tour(raw, last_minute.get(code)) for code, raw in regular.items()]
    tours += [to_tour(raw, raw) for code, raw in last_minute.items() if code not in regular]
    OUTPUT.write_text(
        json.dumps({"scrapedAt": date.today().isoformat(), "tours": tours}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Đã ghi {len(tours)} tour vào {OUTPUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
