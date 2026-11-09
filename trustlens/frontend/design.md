# TrustLens Enterprise Design System Specification

## 1. Design Philosophy
TrustLens is an enterprise-grade digital trust and cybersecurity investigation workspace. The visual language conveys analytical precision, cryptographic credibility, and calm authority. It rejects decorative AI clichés (excessive neon glows, ungrounded particle effects, giant marketing heroes, and arbitrary charts) in favor of high information density, clear visual hierarchy, disciplined typography, and functional data visualization.

---

## 2. Color Palette & Surface Tokens

### Base Surfaces
* **Application Canvas:** `#090E16` (Deep Obsidian Navy)
* **Primary Surface (Panels, Sidebar):** `#0E1520`
* **Secondary Surface (Cards, Nested containers):** `#131C2A`
* **Elevated Surface (Modals, Overlays, Floating panels):** `#1A2536`
* **Interactive Hover Surface:** `#1F2D40`

### Borders & Dividers
* **Primary Border:** `#223042` (Subtle boundary)
* **Secondary / Active Border:** `#32455C`
* **Subtle Divider:** `rgba(255, 255, 255, 0.06)`

### Text Hierarchy
* **Primary Text:** `#E9EEF5` (High legibility white-slate)
* **Secondary Text:** `#9EABC0` (Muted labels & descriptions)
* **Tertiary / Placeholder Text:** `#63738A`
* **Monospace Identifier:** `#CBD5E1`

### Semantic Status Tokens (Mandatory 5-Class Taxonomy)
* **No indicators found:** Restrained Slate-Teal (`#2DD4BF`, bg: `rgba(45, 212, 191, 0.1)`, border: `rgba(45, 212, 191, 0.25)`) — *Strict Rule: Never displayed as "Safe"*
* **Suspicious:** Controlled Amber (`#F59E0B`, bg: `rgba(245, 158, 11, 0.1)`, border: `rgba(245, 158, 11, 0.25)`)
* **High Risk:** Deep Orange-Red (`#F97316`, bg: `rgba(249, 115, 22, 0.1)`, border: `rgba(249, 115, 22, 0.25)`)
* **Confirmed Malicious:** Crimson (`#F43F5E`, bg: `rgba(244, 63, 94, 0.12)`, border: `rgba(244, 63, 94, 0.3)`)
* **Inconclusive:** Neutral Steel (`#94A3B8`, bg: `rgba(148, 163, 184, 0.1)`, border: `rgba(148, 163, 184, 0.2)`)

### Accent Tokens
* **Brand Primary Accent:** `#43B9DB` (Restrained cyan-blue)
* **Secondary Accent:** `#45C69B` (Muted emerald)

---

## 3. Typography Hierarchy

* **Font Stack:**
  * Primary Sans: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
  * Technical Monospace: `var(--font-mono)`, "JetBrains Mono", "Fira Code", monospace
* **Scales:**
  * **Workspace Header:** `24px` / `1.3`, weight `700`
  * **Panel / Section Title:** `17px` / `1.4`, weight `600`
  * **Card Headline / Subhead:** `14px` / `1.4`, weight `600`
  * **Body Copy:** `13px` / `1.5`, weight `400`
  * **Technical Labels & Metadata:** `11px` / `1.4`, weight `500`, uppercase tracking `0.05em`
  * **Evidence Code & Hashes:** `12px` / `1.4`, monospace, tabular numbers

---

## 4. Layout Architecture & Spatial Grid

### Shell Composition (Reference Image 1 Alignment)
* **Outer Canvas:** Viewport container with subtle ambient top radial lighting (`rgba(30, 58, 138, 0.2)`).
* **Application Frame:** Max-width `1440px`, centered with rounded corners (`16px`) and subtle `1px` border (`#223042`).
* **Header Bar:** Height `56px`, horizontal alignment:
  * Left: App Brand & Shield Glyph
  * Center: Navigation Pill tabs (`Overview`, `Scanner`, `Scam Analyzer`, `Web3 Verifier`, `Intel Feed`, `API Docs`)
  * Right: Language Selector & Workspace State
* **Main Area Grid:**
  * Left Contextual Sidebar: `256px` fixed width on desktop (`lg+`), collapsible drawer on tablet/mobile.
  * Workspace Canvas: Flex-1 scrollable area with `24px` padding and vertical rhythm.

---

## 5. Component Inventory & Status

| Component | Category | Status | Action Description |
|---|---|---|---|
| `Navbar.tsx` | Layout | REDESIGN | Transform into compact horizontal pill navigation |
| `Sidebar.tsx` | Layout | NEW | Contextual navigation, recent investigations, quick actions |
| `Footer.tsx` | Layout | REDESIGN | Muted enterprise footer with version, privacy, & status |
| `MetricTicker.tsx` | Layout | REMOVE | Obsolete — remove fabricated static marketing counters |
| `page.tsx` (Dashboard) | App | REDESIGN | Transform landing hero into Security Investigation Overview |
| `UrlScannerInput.tsx` | Scan | REDESIGN | Clean, accessible investigation bar without decorative grid |
| `ScanProgressStream.tsx` | Scan | REDESIGN | Functional investigation pipeline visualizer |
| `TrustGauge.tsx` | Results | REDESIGN | Replace gauge with Five-Class badge, coverage bar, limitations |
| `FindingCard.tsx` | Findings | REDESIGN | Clean evidence card with ID, Signal, Severity, Source, Timestamp |
| `EvidenceBreakdown.tsx`| Findings | REDESIGN | Structured evidence ledger with category & severity filter |
| `CertChainViewer.tsx` | Cert | REDESIGN | Refine X.509 tree visualization with Fermat and CA status |
| `analyze/page.tsx` | Scam | REDESIGN | Two-column layout: Suspicious Language vs Verified Evidence |
| `verify/page.tsx` | Web3 | REDESIGN | Local RFC 8785 canonical Keccak256 hash verifier |
| `feed/page.tsx` | Intel | REDESIGN | Live intelligence stream table with filter & jump to scan |
| `api-docs/page.tsx` | Docs | REDESIGN | Technical API reference |

---

## 6. Anti-AI-Slop Rules
1. Zero oversized neon gradient text.
2. Zero glowing multi-colored card borders.
3. Zero decorative background wireframe grids.
4. Zero fabricated statistics or artificial progress percentages.
5. All metrics, recent investigations, and findings must originate from real API data or user session history. When empty, render an explicit, polished empty state.

