import time, shutil, joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

split = np.load("dataset/test_split.npz")
X_tr, y_tr, X_te, y_te = split["X_train"], split["y_train"], split["X_test"], split["y_test"]

def eval_m(name, m, X_train_in, X_test_in, fit=True):
    if fit: m.fit(X_train_in, y_tr)
    t0 = time.time()
    p = m.predict(X_test_in)
    lat = ((time.time() - t0) / len(X_test_in)) * 1000
    tn, fp, fn, tp = confusion_matrix(y_te, p).ravel()
    return {
        "Model": name, "Acc%": round(accuracy_score(y_te, p)*100, 2),
        "Prec%": round(precision_score(y_te, p, zero_division=0)*100, 2),
        "Rec%": round(recall_score(y_te, p, zero_division=0)*100, 2),
        "F1%": round(f1_score(y_te, p, zero_division=0)*100, 2),
        "FPR%": round((fp / max(fp + tn, 1))*100, 2), "ms/URL": round(lat, 4)
    }

clf = joblib.load("models/url_xgboost.joblib")
res = [
    eval_m("Baseline 1: Logistic Regression", LogisticRegression(max_iter=200), X_tr, X_te),
    eval_m("Baseline 2: Random Forest (Lexical)", RandomForestClassifier(n_estimators=50, max_depth=8, n_jobs=-1), X_tr[:, :15], X_te[:, :15]),
    eval_m("TrustLens Tier 1: XGBoost (26 Features)", clf, X_tr, X_te, fit=False)
]
df_ab = pd.DataFrame(res)
df_ab.to_csv("models/ablation_evaluation_report.csv", index=False)
print(df_ab.to_string(index=False))

shutil.make_archive("trustlens_member1_artifacts", "zip", "models")
print("\nAll Done! Download 'trustlens_member1_artifacts.zip' from the Kaggle Output panel.")