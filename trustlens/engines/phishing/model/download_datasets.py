import os
import csv
import io
import zipfile
import requests

from tranco import Tranco

RAW_DIR = "dataset/raw"

os.makedirs(RAW_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "TrustLens-Research/1.0"
}

TIMEOUT = 120


def save_response(response, output_path):
    """Save only a successful, non-empty HTTP response."""
    response.raise_for_status()

    content = response.content

    if not content:
        raise ValueError("Downloaded file is empty.")

    if content[:500].lstrip().lower().startswith(
        (b"<!doctype html", b"<html")
    ):
        raise ValueError("Server returned an HTML error page.")

    with open(output_path, "wb") as f:
        f.write(content)

    print("Saved:", output_path)
    print("Size:", round(len(content) / 1024, 2), "KB")


# =====================================================
# 1. URLHAUS
# =====================================================

def download_urlhaus():
    print("\n1/5 Downloading URLhaus...")

    auth_key = os.getenv("URLHAUS_AUTH_KEY")

    if not auth_key:
        print("SKIPPED: URLHAUS_AUTH_KEY is not configured.")
        return

    url = (
        "https://urlhaus-api.abuse.ch/v2/files/exports/"
        f"{auth_key}/recent.csv"
    )

    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=TIMEOUT
        )

        output = os.path.join(RAW_DIR, "urlhaus.csv")
        save_response(response, output)

        print("URLhaus download successful!")

    except Exception as e:
        print("URLhaus download failed:", e)


# =====================================================
# 2. OPENPHISH
# =====================================================

def download_openphish():
    print("\n2/5 Downloading OpenPhish...")

    url = "https://openphish.com/feed.txt"

    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=TIMEOUT
        )

        response.raise_for_status()

        lines = [
            line.strip()
            for line in response.text.splitlines()
            if line.strip().startswith(("http://", "https://"))
        ]

        if not lines:
            raise ValueError("No valid URLs found.")

        output = os.path.join(RAW_DIR, "openphish.txt")

        with open(output, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        print("OpenPhish downloaded successfully!")
        print("URLs:", len(lines))

    except Exception as e:
        print("OpenPhish download failed:", e)


# =====================================================
# 3. PHISHTANK
# =====================================================

def download_phishtank():
    print("\n3/5 Downloading PhishTank...")

    app_key = os.getenv("PHISHTANK_APP_KEY")

    if not app_key:
        print("SKIPPED: PHISHTANK_APP_KEY is not configured.")
        return

    url = (
        "https://data.phishtank.com/data/"
        f"{app_key}/online-valid.csv"
    )

    headers = {
        "User-Agent": "phishtank/TrustLens-Research"
    }

    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=TIMEOUT
        )

        response.raise_for_status()

        # Validate CSV header before replacing the existing file.
        first_line = response.content[:2000].decode(
            "utf-8-sig", errors="replace"
        ).splitlines()[0]

        if "phish_id" not in first_line.lower():
            raise ValueError("Invalid PhishTank CSV header.")

        output = os.path.join(RAW_DIR, "phishtank.csv")

        save_response(response, output)

        print("PhishTank download successful!")

    except Exception as e:
        print("PhishTank download failed:", e)


# =====================================================
# 4. TRANCO
# =====================================================

def download_tranco():
    print("\n4/5 Downloading Tranco Top Sites...")

    cache_dir = "D:/AI_Models/Tranco"

    try:
        os.makedirs(cache_dir, exist_ok=True)

        tranco = Tranco(
            cache=True,
            cache_dir=cache_dir
        )

        latest_list = tranco.list()
        domains = latest_list.top(100000)

        if not domains:
            raise ValueError("Tranco returned no domains.")

        output = os.path.join(RAW_DIR, "tranco.csv")

        with open(
            output, "w", newline="", encoding="utf-8"
        ) as f:

            writer = csv.writer(f)
            writer.writerow(["rank", "domain"])

            for rank, domain in enumerate(domains, start=1):
                writer.writerow([rank, domain])

        print("Tranco downloaded successfully!")
        print("Domains:", len(domains))

    except Exception as e:
        print("Tranco download failed:", e)


# =====================================================
# 5. PHIUSIIL
# =====================================================

def download_phiusiil():
    print("\n5/5 Checking PhiUSIIL dataset...")

    output = os.path.join(
        RAW_DIR,
        "PhiUSIIL_Phishing_URL_Dataset.csv"
    )

    # Do not download again if the existing CSV is valid.
    if os.path.exists(output) and os.path.getsize(output) > 1000000:
        print("Existing PhiUSIIL CSV found.")
        print("Size:", round(os.path.getsize(output) / 1024 / 1024, 2), "MB")
        print("Skipping duplicate download.")
        return

    url = (
        "https://archive.ics.uci.edu/static/public/967/"
        "phiusiil+phishing+url+dataset.zip"
    )

    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=TIMEOUT
        )

        response.raise_for_status()

        with zipfile.ZipFile(io.BytesIO(response.content)) as archive:

            csv_files = [
                name for name in archive.namelist()
                if name.lower().endswith(".csv")
            ]

            if not csv_files:
                raise ValueError("No CSV found inside PhiUSIIL ZIP.")

            # Extract only the required CSV.
            with archive.open(csv_files[0]) as source:
                with open(output, "wb") as destination:
                    destination.write(source.read())

        print("PhiUSIIL extracted successfully!")

    except Exception as e:
        print("PhiUSIIL download failed:", e)


# =====================================================
# MAIN
# =====================================================

def download_all():

    print("=" * 50)
    print("       TRUSTLENS DATASET DOWNLOADER")
    print("=" * 50)

    download_urlhaus()
    download_openphish()
    download_phishtank()
    download_tranco()
    download_phiusiil()

    print("\n" + "=" * 50)
    print("DATASET DOWNLOAD PROCESS FINISHED")
    print("=" * 50)

    print("\nFiles in dataset/raw:")

    for filename in os.listdir(RAW_DIR):
        path = os.path.join(RAW_DIR, filename)

        if os.path.isfile(path):
            size = os.path.getsize(path) / 1024

            print(f"{filename}: {size:.2f} KB")


if __name__ == "__main__":
    download_all()
