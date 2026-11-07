export const DEPRECATED_TLS_PROTOCOLS = ['SSLv2', 'SSLv3', 'TLSv1.0', 'TLSv1.1'];

export const SECURE_TLS_PROTOCOLS = ['TLSv1.2', 'TLSv1.3'];

export const WEAK_CIPHER_SUITES = [
  'TLS_RSA_WITH_RC4_128_SHA',
  'TLS_RSA_WITH_3DES_EDE_CBC_SHA',
  'TLS_RSA_WITH_AES_128_CBC_SHA',
  'TLS_ECDHE_RSA_WITH_RC4_128_SHA',
  'TLS_RSA_WITH_NULL_SHA',
];

export const CCADB_DISTRUST_ADVISORIES = [
  {
    authority: 'eMudhra Sub-CA 2024/2025',
    advisoryId: 'CCADB-ADV-2025-01',
    reason: 'Non-compliant subordinate CA issuance & cross-signature audit failures',
    status: 'distrusted',
    effectiveDate: '2025-01-15',
  },
  {
    authority: 'WoSign / StartCom',
    advisoryId: 'CABF-BR-WOSIGN',
    reason: 'Backdating SSL certificates & cryptographic non-compliance',
    status: 'permanently_revoked',
    effectiveDate: '2016-10-31',
  },
];

