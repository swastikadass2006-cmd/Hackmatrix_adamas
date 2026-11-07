
import os
import gc
import numpy as np
import pandas as pd

RAW_DIR = "dataset/raw"
OUTPUT_DIR = "dataset"

def merge_datasets():
    dfs = []

    # 1. PhiUSIIL dataset
    print("Loading PhiUSIIL...")

    phi_path = os.path.join(
        RAW_DIR, "PhiUSIIL_Phishing_URL_Dataset.csv"
    )

    df_phi = pd.read_csv(
        phi_path,
        usecols=["URL", "label"]
    )

    df_phi = df_phi.rename(columns={"URL": "url"})

    # Verify original label meanings before using this mapping.
    # Expected original: 1 = legitimate, 0 = phishing.
    df_phi["label"] = df_phi["label"].map({
        1: 0,
        0: 1
    })

    df_phi = df_phi.dropna(subset=["url", "label"])
    df_phi["label"] = df_phi["label"].astype(np.int8)
    df_phi["source"] = "phiusiil"

    dfs.append(df_phi[["url", "label", "source"]])

    # 2. OpenPhish dataset
    print("Loading OpenPhish...")

    open_path = os.path.join(RAW_DIR, "openphish.txt")

    with open(open_path, "r", encoding="utf-8") as f:
        op_urls = [
            line.strip()
            for line in f
            if line.strip().startswith("http")
        ]

    df_op = pd.DataFrame({
        "url": op_urls,
        "label": np.int8(1),
        "source": "openphish"
    })

    dfs.append(df_op)

    # 3. Merge datasets
    print("Merging datasets...")

    master_df = pd.concat(dfs, ignore_index=True)
    del dfs
    gc.collect()

    master_df["url"] = (
        master_df["url"].astype(str).str.strip()
    )

    master_df = master_df[
        master_df["url"].str.startswith(
            ("http://", "https://")
        )
    ]

    # Resolve conflicting labels conservatively.
    # If any source identifies a URL as malicious,
    # retain the malicious label.
    master_df = (
        master_df.groupby("url", as_index=False)
        .agg(
            label=("label", "max"),
            source=("source", lambda s: ",".join(sorted(set(s)))
            )
        )
    )

    master_df["label"] = master_df["label"].astype(np.int8)

    print("\nDataset breakdown (0=Benign, 1=Malicious):")
    print(master_df.groupby(["source", "label"]).size())

    print("\nTotal unique URLs:", len(master_df))
    print("\nClass distribution:")
    print(master_df["label"].value_counts())

    # Check both classes exist
    if master_df["label"].nunique() != 2:
        raise ValueError(
            "Dataset must contain both benign and malicious URLs."
        )

    output_path = os.path.join(
        OUTPUT_DIR, "master_merged_urls.parquet"
    )

    master_df.to_parquet(output_path, index=False)

    print("\nMerge completed successfully!")
    print("Saved:", output_path)

    del master_df
    gc.collect()


if __name__ == "__main__":
    merge_datasets()
