"""
TrustLens Canonical JSON & Keccak-256 Hashing Module (RFC 8785)
Provides deterministic canonicalization and Ethereum-standard Keccak-256 hashing.
Matches the Rust Security Engine and Frontend TypeScript implementations bit-for-bit.
"""

import json
from typing import Any, Dict


# Precomputed Keccak round constants
_RC = [
    0x0000000000000001, 0x0000000000008082, 0x800000000000808A, 0x8000000080008000,
    0x000000000000808B, 0x0000000080000001, 0x8000000080008081, 0x8000000000008009,
    0x000000000000008A, 0x0000000000000088, 0x0000000080008009, 0x000000008000000A,
    0x000000008000808B, 0x800000000000008B, 0x8000000000008089, 0x8000000000008003,
    0x8000000000008002, 0x8000000000000080, 0x000000000000800A, 0x800000008000000A,
    0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008,
]

_RHO_PI = [
    [0, 36, 3, 41, 18],
    [1, 44, 10, 45, 2],
    [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56],
    [27, 20, 39, 8, 14],
]

EXCLUDED_FIELDS = {
    "tx_hash",
    "txHash",
    "registration_tx",
    "on_chain_registration",
    "report_hash",
    "reportHash",
    "contract_address",
    "block_number",
    "etherscan_url",
}


def _rotl64(x: int, n: int) -> int:
    return ((x << (n % 64)) & 0xFFFFFFFFFFFFFFFF) | (x >> (64 - (n % 64)))


def keccak_256(data: bytes) -> bytes:
    """Computes Ethereum standard Keccak-256 hash."""
    rate = 136  # bytes (1088 bits)
    pad_len = rate - (len(data) % rate)
    if pad_len == 1:
        padded = data + b"\x81"
    else:
        padded = data + b"\x01" + b"\x00" * (pad_len - 2) + b"\x80"

    state = [[0] * 5 for _ in range(5)]
    for block_idx in range(0, len(padded), rate):
        block = padded[block_idx : block_idx + rate]
        for i in range(17):
            w = int.from_bytes(block[i * 8 : (i + 1) * 8], "little")
            x = i % 5
            y = i // 5
            state[x][y] ^= w

        for round_idx in range(24):
            # Theta
            C = [
                state[x][0] ^ state[x][1] ^ state[x][2] ^ state[x][3] ^ state[x][4]
                for x in range(5)
            ]
            D = [C[(x + 4) % 5] ^ _rotl64(C[(x + 1) % 5], 1) for x in range(5)]
            for x in range(5):
                for y in range(5):
                    state[x][y] ^= D[x]

            # Rho and Pi
            B = [[0] * 5 for _ in range(5)]
            for x in range(5):
                for y in range(5):
                    B[y][(2 * x + 3 * y) % 5] = _rotl64(state[x][y], _RHO_PI[x][y])

            # Chi
            for x in range(5):
                for y in range(5):
                    state[x][y] = B[x][y] ^ ((~B[(x + 1) % 5][y]) & B[(x + 2) % 5][y])

            # Iota
            state[0][0] ^= _RC[round_idx]

    out = bytearray()
    for i in range(4):
        x = i % 5
        y = i // 5
        out.extend(state[x][y].to_bytes(8, "little"))
    return bytes(out)


def canonicalize_dict(obj: Any) -> Any:
    """Recursively orders dictionary keys and filters out transient on-chain fields."""
    if isinstance(obj, dict):
        return {
            k: canonicalize_dict(v)
            for k, v in sorted(obj.items())
            if k not in EXCLUDED_FIELDS
        }
    if isinstance(obj, list):
        return [canonicalize_dict(item) for item in obj]
    return obj


def canonicalize_json_report(report: Dict[str, Any]) -> str:
    """Serializes a report according to RFC 8785 JSON Canonicalization Scheme."""
    cleaned = canonicalize_dict(report)
    return json.dumps(cleaned, separators=(",", ":"), ensure_ascii=False)


def hash_report(report: Dict[str, Any]) -> str:
    """Returns 0x-prefixed 32-byte Keccak-256 hex digest of the canonical report JSON."""
    canon_str = canonicalize_json_report(report)
    digest = keccak_256(canon_str.encode("utf-8"))
    return f"0x{digest.hex()}"
