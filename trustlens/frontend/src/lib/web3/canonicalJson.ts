import { keccak256, toUtf8Bytes } from 'ethers';

/**
 * Fields to exclude from hashing because they are assigned post-hashing
 * (such as blockchain transaction hash or contract registration metadata).
 */
const EXCLUDED_HASH_FIELDS = new Set([
  'tx_hash',
  'txHash',
  'on_chain_registration',
  'onChainRegistration',
  'report_hash',
  'reportHash',
  'contract_address',
  'contractAddress',
  'block_number',
  'blockNumber',
  'etherscan_url',
  'etherscanUrl',
]);

/**
 * Recursively cleans an object and sorts its keys lexicographically
 * according to RFC 8785 (JSON Canonicalization Scheme).
 */
export function canonicalizeObject(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => canonicalizeObject(item));
  }

  const record = obj as Record<string, unknown>;
  const sortedKeys = Object.keys(record)
    .filter((k) => !EXCLUDED_HASH_FIELDS.has(k))
    .sort();

  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    result[key] = canonicalizeObject(record[key]);
  }
  return result;
}

/**
 * Produces a deterministic canonical JSON string following RFC 8785:
 * - Excludes runtime blockchain metadata fields
 * - Lexicographical UTF-16 key sorting
 * - No whitespace around delimiters (':', ',')
 * - Preserves numerical and boolean formats
 */
export function canonicalizeJson(report: Record<string, unknown>): string {
  const cleaned = canonicalizeObject(report);
  return JSON.stringify(cleaned);
}

/**
 * Hashes a report using RFC 8785 JCS + Keccak-256.
 * Returns a 0x-prefixed 32-byte hex string (bytes32 in Solidity).
 */
export function hashReport(report: Record<string, unknown>): string {
  const canonStr = canonicalizeJson(report);
  return keccak256(toUtf8Bytes(canonStr));
}
