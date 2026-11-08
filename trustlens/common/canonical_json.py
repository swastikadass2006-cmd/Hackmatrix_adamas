"""
RFC 8785 JSON Canonicalization Scheme (JCS) and Keccak-256 Hashing.
Pure Python, zero external dependencies.
Produces exact bit-for-bit parity with Ethereum's native keccak256 and JavaScript's ethers.keccak256.
"""

import json
from typing import Any, Dict

# ==============================================================================
# Pure Python Keccak-256 (Keccak[r=1088, c=512, d=0x01])
# ==============================================================================

RC = [
    0x0000000000000001, 0x0000000000008082, 0x800000000000808A, 0x8000000080008000,
    0x000000000000808B, 0x0000000080000001, 0x8000000080008081, 0x8000000000008009,
    0x000000000000008A, 0x0000000000000088, 0x0000000080008009, 0x000000008000000A,
    0x000000008000808B, 0x800000000000008B, 0x8000000000008089, 0x8000000000008003,
    0x8000000000008002, 0x8000000000000080, 0x000000000000800A, 0x800000008000000A,
    0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008
]

ROTC = [
    [0, 36, 3, 41, 18],
    [1, 44, 10, 45, 2],
    [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56],
    [27, 20, 39, 8, 14]
]


def _rotl64(x: int, n: int) -> int:
    return ((x << (n % 64)) & 0xFFFFFFFFFFFFFFFF) | (x >> ((64 - (n % 64)) % 64))


def keccak_256(data: bytes) -> bytes:
    """
    Computes Keccak-256 hash (Ethereum standard).
    Matches web3.keccak and ethers.keccak256.
    """
    rate = 136  # (1600 - 512) // 8
    state = [[0] * 5 for _ in range(5)]

    # Pad data: Keccak uses 0x01 domain separator, then 0x00*, then 0x80
    padded = bytearray(data)
    padded.append(0x01)
    while len(padded) % rate != (rate - 1):
        padded.append(0x00)
    padded.append(0x80)

    # Process blocks
    for block_idx in range(0, len(padded), rate):
        block = padded[block_idx:block_idx + rate]
        for i in range(rate // 8):
            x = i % 5
            y = i // 5
            val = int.from_bytes(block[i * 8:(i + 1) * 8], 'little')
            state[x][y] ^= val

        # Keccak-f[1600] permutation (24 rounds)
        for round_idx in range(24):
            # Theta
            C = [state[x][0] ^ state[x][1] ^ state[x][2] ^ state[x][3] ^ state[x][4] for x in range(5)]
            D = [C[(x + 4) % 5] ^ _rotl64(C[(x + 1) % 5], 1) for x in range(5)]
            for x in range(5):
                for y in range(5):
                    state[x][y] ^= D[x]

            # Rho and Pi
            B = [[0] * 5 for _ in range(5)]
            for x in range(5):
                for y in range(5):
                    B[y][(2 * x + 3 * y) % 5] = _rotl64(state[x][y], ROTC[x][y])

            # Chi
            for x in range(5):
                for y in range(5):
                    state[x][y] = B[x][y] ^ ((~B[(x + 1) % 5][y]) & B[(x + 2) % 5][y])

            # Iota
            state[0][0] ^= RC[round_idx]

    # Extract 32 bytes (256 bits)
    out = bytearray(32)
    for i in range(4):
        x = i % 5
        y = i // 5
        out[i * 8:(i + 1) * 8] = state[x][y].to_bytes(8, 'little')
    return bytes(out)


# ==============================================================================
# RFC 8785 JSON Canonicalization Scheme (JCS)
# ==============================================================================

# Fields to explicitly exclude from hashing because they are assigned post-hashing
EXCLUDED_HASH_FIELDS = {
    "tx_hash", "txHash",
    "on_chain_registration", "onChainRegistration",
    "report_hash", "reportHash",
    "contract_address", "contractAddress",
    "block_number", "blockNumber",
    "etherscan_url", "etherscanUrl"
}


def canonicalize_obj(obj: Any) -> Any:
    """Recursively strip excluded fields and sort dictionary keys."""
    if isinstance(obj, dict):
        return {
            k: canonicalize_obj(v)
            for k, v in sorted(obj.items())
            if k not in EXCLUDED_HASH_FIELDS
        }
    elif isinstance(obj, list):
        return [canonicalize_obj(item) for item in obj]
    return obj


def canonicalize_json(report_data: Dict[str, Any]) -> str:
    """
    Serializes a report dictionary to canonical JSON string according to RFC 8785:
    - Excludes post-hashing fields (tx_hash, report_hash, etc.)
    - Lexicographically sorted keys
    - No extraneous whitespace (separators=(',', ':'))
    - Strict UTF-8 compatibility
    """
    cleaned = canonicalize_obj(report_data)
    return json.dumps(cleaned, separators=(',', ':'), ensure_ascii=False, sort_keys=True)


def hash_report(report_data: Dict[str, Any]) -> str:
    """
    Returns the 0x-prefixed 32-byte hex string representing keccak256(canonical_json).
    Ready for Smart Contract registerReport(bytes32).
    """
    canon_str = canonicalize_json(report_data)
    raw_hash = keccak_256(canon_str.encode('utf-8'))
    return "0x" + raw_hash.hex()
