
import gc
import math
import re
from urllib.parse import urlparse

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold

IP_REGEX = re.compile(
    r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
)

SUSP_TLDS = (".xyz", ".top", ".tk", ".club", ".work")


def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0

    length = len(s)

    return -sum(
        (s.count(c) / length) * math.log2(s.count(c) / length)
        for c in set(s)
    )


def extract_url_vector(url: str) -> list:
    url = str(url).strip()
    parsed = urlparse(url)

    h = parsed.hostname or ""
    p = parsed.path or ""
    u = url.lower()
    ul = len(url)

    return [
        ul,
        len(h),
        len(p),
        shannon_entropy(url),
        shannon_entropy(h),
        url.count("."),
        url.count("-"),
        url.count("@"),
        url.count("?"),
        url.count("="),
        url.count("//"),
        1 if parsed.scheme == "https" else 0,
        1 if IP_REGEX.match(h) else 0,
        h.count("."),
        sum(c.isdigit() for c in url) / (ul + 1),
        sum(c.isalpha() for c in url) / (ul + 1),
        1 if "xn--" in h else 0,
        1 if any(t in h for t in SUSP_TLDS) else 0,
        url.count("/"),
        1 if "//" in p else 0,
        len(parsed.query),
        sum(c.isdigit() for c in h),
        1 if "-" in h else 0,
        1 if ("login" in u or "signin" in u) else 0,
        1 if ("verify" in u or "secure" in u) else 0,
        1 if ("bank" in u or "update" in u) else 0
    ]


def extract_hostname(url: str) -> str:
    try:
        hostname = urlparse(str(url)).hostname
        return hostname.lower().rstrip(".") if hostname else str(url)
    except ValueError:
        return str(url)


def main():

    input_path = "dataset/master_merged_urls.parquet"

    print("Loading merged dataset...")

    df = pd.read_parquet(input_path)
    df = df.dropna(subset=["url", "label"]).copy()

    urls = df["url"].astype(str).tolist()
    y = df["label"].values.astype(np.int8)

    # Group URLs by hostname to reduce domain leakage.
    print("Extracting hostname groups...")

    groups = np.array(
        [extract_hostname(url) for url in urls]
    )

    del df
    gc.collect()

    print(f"Extracting features for {len(urls)} URLs...")

    X = np.array(
        [extract_url_vector(url) for url in urls],
        dtype=np.float32
    )

    del urls
    gc.collect()

    # Keep each hostname entirely in one split.
    print("Creating domain-grouped train/test split...")

    splitter = StratifiedGroupKFold(
        n_splits=5,
        shuffle=True,
        random_state=42
    )

    train_idx, test_idx = next(
        splitter.split(X, y, groups=groups)
    )

    X_train = X[train_idx]
    y_train = y[train_idx]

    X_test = X[test_idx]
    y_test = y[test_idx]

    train_groups = set(groups[train_idx])
    test_groups = set(groups[test_idx])

    overlap = train_groups.intersection(test_groups)

    print("\nDOMAIN LEAKAGE CHECK")
    print("-------------------------")
    print("Training hostnames:", len(train_groups))
    print("Testing hostnames:", len(test_groups))
    print("Overlapping hostnames:", len(overlap))

    if overlap:
        raise ValueError("Hostname leakage detected!")

    # Save arrays in the same format used by train_model.py.
    np.savez_compressed(
        "dataset/test_split.npz",
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test
    )

    print("\nFeature extraction completed!")
    print("Feature count:", X.shape[1])
    print("Training samples:", len(X_train))
    print("Testing samples:", len(X_test))

    print("\nTraining class distribution:")
    print(pd.Series(y_train).value_counts())

    print("\nTesting class distribution:")
    print(pd.Series(y_test).value_counts())

    print("\nSaved: dataset/test_split.npz")


if __name__ == "__main__":
    main()
