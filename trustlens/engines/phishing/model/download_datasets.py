import os
import requests
import zipfile
import io

os.makedirs("dataset/raw", exist_ok=True)
os.makedirs("models", exist_ok=True)

def download_all():
    headers = {"User-Agent": "Mozilla/5.0 (TrustLens-Research/1.0)"}

    # 1. URLhaus (Malicious)
    print("1/5 Downloading URLhaus...")
    r = requests.get("https://urlhaus.abuse.ch/downloads/csv_recent/", headers=headers)
    with open("dataset/raw/urlhaus.csv", "wb") as f:
        f.write(r.content)

    # 2. OpenPhish (Malicious)
    print("2/5 Downloading OpenPhish...")
    r = requests.get("https://openphish.com/feed.txt", headers=headers)
    with open("dataset/raw/openphish.txt", "wb") as f:
        f.write(r.content)

    # 3. PhishTank (Malicious - with fallback if rate-limited)
    print("3/5 Downloading PhishTank...")
    try:
        r = requests.get("http://data.phishtank.com/data/online-valid.csv", headers=headers, timeout=30)
        if r.status_code == 200 and b"phish_id" in r.content[:200]:
            with open("dataset/raw/phishtank.csv", "wb") as f:
                f.write(r.content)
            print("   -> PhishTank downloaded successfully.")
        else:
            print(f"   -> PhishTank rate-limited (HTTP {r.status_code}). Proceeding with other 4 datasets.")
    except Exception as e:
        print(f"   -> PhishTank skipped ({e}).")

    # 4. Tranco Top Sites (Benign)
    print("4/5 Downloading Tranco Top Sites...")
    r = requests.get("https://tranco-list.eu/download/daily/latest", headers=headers)
    with open("dataset/raw/tranco.csv", "wb") as f:
        f.write(r.content)

    # 5. PhiUSIIL Dataset (UCI Repository ZIP)
    print("5/5 Downloading & Extracting PhiUSIIL (UCI)...")
    r = requests.get("https://archive.ics.uci.edu/static/public/967/phiusiil+phishing+url+dataset.zip", headers=headers)
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        z.extractall("dataset/raw/")

    print("\nAll downloads complete! Files stored in /kaggle/working/dataset/raw/")

download_all()