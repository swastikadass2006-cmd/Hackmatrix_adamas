use serde::{Deserialize, Serialize};
use serde_json::Value;
use tiny_keccak::{Hasher, Keccak};

#[derive(Debug, Serialize, Deserialize)]
pub struct CanonicalResponse {
    pub canonical_json: String,
    pub keccak256_hash: String,
    pub algorithm: String,
    pub rfc: String,
}

/// Normalizes a JSON object by stripping post-registration on-chain fields
/// like `tx_hash` and `registration_tx`, then serializing according to RFC 8785 (JCS).
pub fn canonicalize_report(value: &Value) -> Result<String, String> {
    let mut cleaned_value = value.clone();
    strip_transient_fields(&mut cleaned_value);

    serde_jcs::to_string(&cleaned_value).map_err(|e| format!("RFC 8785 serialization failed: {}", e))
}

/// Computes Ethereum Keccak-256 hash of byte slice and returns `0x`-prefixed 64-char hex string.
pub fn keccak256(bytes: &[u8]) -> String {
    let mut keccak = Keccak::v256();
    let mut output = [0u8; 32];
    keccak.update(bytes);
    keccak.finalize(&mut output);

    let hex_str: String = output.iter().map(|b| format!("{:02x}", b)).collect();
    format!("0x{}", hex_str)
}

/// Strips transient execution fields that are not part of the pre-image
fn strip_transient_fields(v: &mut Value) {
    if let Value::Object(map) = v {
        map.remove("tx_hash");
        map.remove("registration_tx");
        map.remove("block_number");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rfc_8785_and_keccak256_against_test_vector() {
        let test_vector_raw = include_str!("../../../common/test_vector.json");
        let parsed: Value = serde_json::from_str(test_vector_raw)
            .expect("Valid test vector JSON");

        let input_report = &parsed["input_report"];
        let expected_canonical = parsed["expected_canonical_json"]
            .as_str()
            .expect("expected_canonical_json string");
        let expected_keccak = parsed["expected_keccak256"]
            .as_str()
            .expect("expected_keccak256 string");

        let canonical_str = canonicalize_report(input_report)
            .expect("Canonicalization succeeded");

        assert_eq!(
            canonical_str, expected_canonical,
            "Canonical RFC 8785 JSON representation mismatch"
        );

        let hash = keccak256(canonical_str.as_bytes());
        assert_eq!(
            hash, expected_keccak,
            "Keccak-256 hash output mismatch against shared test vector"
        );
    }
}
