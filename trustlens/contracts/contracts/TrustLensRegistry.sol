// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrustLensRegistry
 * @dev Public, tamper-evident registry for TrustLens digital trust & scam reports.
 * Stores only cryptographic hashes (RFC 8785 JSON Canonicalization + keccak256).
 * No raw URLs, messages, or sensitive user data is ever written to storage.
 * Immutable: No administrative overwrite or deletion functions exist.
 */
contract TrustLensRegistry {
    // Report type identifiers:
    // 1 = Web Domain / URL Scan
    // 2 = Scam Message Analysis
    // 3 = Threat Intelligence / Brand Impersonation
    enum ReportType { Unknown, UrlScan, ScamMessage, ThreatIntel }

    struct ReportRecord {
        address reporter;
        uint64 timestamp;
        ReportType reportType;
        bool exists;
    }

    // Mapping from report canonical keccak256 hash => ReportRecord
    mapping(bytes32 => ReportRecord) private _reports;

    // Total counter of registered reports
    uint256 public totalReports;

    // Event emitted upon immutable registration
    event ReportRegistered(
        bytes32 indexed reportHash,
        address indexed reporter,
        uint64 timestamp,
        ReportType indexed reportType
    );

    /**
     * @notice Register a tamper-evident report hash on-chain.
     * @dev Rejects duplicate registrations so the first record and timestamp are preserved forever.
     * @param reportHash The 32-byte keccak256 hash of the canonical RFC 8785 report JSON.
     * @param reportType Type classification (1: UrlScan, 2: ScamMessage, 3: ThreatIntel).
     */
    function registerReport(bytes32 reportHash, ReportType reportType) external {
        require(reportHash != bytes32(0), "TrustLens: Invalid zero hash");
        require(reportType != ReportType.Unknown, "TrustLens: Invalid report type");
        require(!_reports[reportHash].exists, "TrustLens: Report hash already registered");

        uint64 currentTime = uint64(block.timestamp);

        _reports[reportHash] = ReportRecord({
            reporter: msg.sender,
            timestamp: currentTime,
            reportType: reportType,
            exists: true
        });

        totalReports += 1;

        emit ReportRegistered(reportHash, msg.sender, currentTime, reportType);
    }

    /**
     * @notice Lookup and verify an on-chain report by hash.
     * @param reportHash The 32-byte keccak256 hash to query.
     * @return reporter Address that registered the report.
     * @return timestamp Unix timestamp when the report was recorded.
     * @return reportType Type classification code.
     * @return exists True if the report exists on-chain; false otherwise.
     */
    function getReport(bytes32 reportHash)
        external
        view
        returns (
            address reporter,
            uint64 timestamp,
            ReportType reportType,
            bool exists
        )
    {
        ReportRecord memory r = _reports[reportHash];
        return (r.reporter, r.timestamp, r.reportType, r.exists);
    }

    /**
     * @notice Quick boolean check if a report hash is registered.
     */
    function isRegistered(bytes32 reportHash) external view returns (bool) {
        return _reports[reportHash].exists;
    }
}
